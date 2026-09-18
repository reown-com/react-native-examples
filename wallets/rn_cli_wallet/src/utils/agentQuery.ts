/**
 * testID -> on-screen rectangle, for the dev agent.
 *
 * WHY THIS EXISTS
 * Maestro's `tapOn: id:` is correct but not cheap: on native it dumps the whole
 * view hierarchy (UiAutomator on Android, XCUITest on iOS), matches against it,
 * and re-polls until it settles — on every command. This module lets the app
 * answer "where is <testID>?" itself, so a flow can spend one socket round-trip
 * instead of a hierarchy dump and then still tap the returned point with a real
 * OS touch. The socket speeds up *finding*; it does not replace *touching*.
 *
 * WHAT IT CANNOT DO
 * It cannot detect occlusion. Nothing in the React tree knows that another view
 * is drawn on top. That is precisely why the tap stays with Maestro: a point tap
 * that misses is real evidence something is covering the target, and a `found`
 * result here is a claim about the tree, not a promise about the pixels.
 *
 * TWO STRATEGIES
 * 1. `fiber` — walk React's internal tree looking for `props.testID`. Needs no
 *    changes to product components, but uses React internals.
 * 2. `registry` — components opt in via `useAgentTarget(testID)`. Always works,
 *    but only covers what has been wired up.
 *
 * `query` tries fiber first and falls back to the registry, and always reports
 * which strategy answered, so the first real run on a device tells you whether
 * the fiber walk survives this React/RN version instead of leaving you guessing.
 */
import { Component, useCallback } from 'react';
import { Dimensions, PixelRatio, StyleSheet } from 'react-native';

type Measurable = {
  measureInWindow?: (
    callback: (x: number, y: number, width: number, height: number) => void,
  ) => void;
};

export type AgentQueryResult = {
  found: boolean;
  strategy: 'fiber' | 'registry' | 'none';
  /** Center point, in physical pixels — what Maestro's `tapOn: point:` wants. */
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  /** Same rect in density-independent points, for debugging the conversion. */
  dp?: { x: number; y: number; width: number; height: number };
  onScreen?: boolean;
  opacity?: number;
  error?: string;
};

/* ------------------------------------------------------------ the registry */

const registry = new Map<string, Measurable>();

export function registerAgentTarget(testID: string, instance: unknown) {
  if (instance) {
    registry.set(testID, instance as Measurable);
  } else {
    registry.delete(testID);
  }
}

/**
 * Opt a component into agent addressing:
 *   const ref = useAgentTarget('button-scan');
 *   <Pressable ref={ref} testID="button-scan" />
 */
export function useAgentTarget(testID: string) {
  return useCallback(
    (instance: unknown) => registerAgentTarget(testID, instance),
    [testID],
  );
}

/* ----------------------------------------------------------- the fiber walk */

type Fiber = {
  return?: Fiber | null;
  child?: Fiber | null;
  sibling?: Fiber | null;
  stateNode?: unknown;
  memoizedProps?: Record<string, unknown> | null;
};

let probeFiber: Fiber | null = null;

/**
 * A zero-render class component mounted once by the dev agent. Class instances
 * expose `_reactInternals`, which is our only dependency-free way into the fiber
 * tree — the React DevTools global hook is not installed in release-flavoured
 * builds, and the `internal` variant CI tests is one.
 */
export class AgentFiberProbe extends Component {
  componentDidMount() {
    probeFiber =
      (this as unknown as { _reactInternals?: Fiber })._reactInternals ?? null;
  }
  componentWillUnmount() {
    probeFiber = null;
  }
  render() {
    return null;
  }
}

function findRoot(fiber: Fiber): Fiber {
  let current = fiber;
  while (current.return) {
    current = current.return;
  }
  return current;
}

function isMeasurable(node: unknown): node is Measurable {
  return !!node && typeof (node as Measurable).measureInWindow === 'function';
}

/** First measurable host instance at or below `fiber`. */
function findHostInstance(fiber: Fiber): Measurable | null {
  if (isMeasurable(fiber.stateNode)) {
    return fiber.stateNode;
  }
  let child = fiber.child;
  while (child) {
    const found = findHostInstance(child);
    if (found) return found;
    child = child.sibling;
  }
  return null;
}

function findByTestId(
  root: Fiber,
  testID: string,
): { instance: Measurable; opacity?: number } | null {
  const stack: Fiber[] = [root];

  while (stack.length) {
    const fiber = stack.pop() as Fiber;
    const props = fiber.memoizedProps;

    if (props && props.testID === testID) {
      const instance = findHostInstance(fiber);
      if (instance) {
        const flattened = StyleSheet.flatten(props.style as never) as
          | { opacity?: number }
          | undefined;
        return { instance, opacity: flattened?.opacity };
      }
    }

    let child = fiber.child;
    while (child) {
      stack.push(child);
      child = child.sibling;
    }
  }

  return null;
}

/* ------------------------------------------------------------------ measure */

function measure(instance: Measurable) {
  return new Promise<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(resolve => {
    if (typeof instance.measureInWindow !== 'function') {
      resolve(null);
      return;
    }
    // measureInWindow never calls back for an unmounted or zero-size node, so
    // a timer keeps `query` from hanging until the daemon's request timeout.
    const timer = setTimeout(() => resolve(null), 1000);
    instance.measureInWindow((x, y, width, height) => {
      clearTimeout(timer);
      resolve({ x, y, width, height });
    });
  });
}

export async function queryTestId(testID: string): Promise<AgentQueryResult> {
  let instance: Measurable | null = null;
  let strategy: AgentQueryResult['strategy'] = 'none';
  let opacity: number | undefined;

  if (probeFiber) {
    try {
      const hit = findByTestId(findRoot(probeFiber), testID);
      if (hit) {
        instance = hit.instance;
        opacity = hit.opacity;
        strategy = 'fiber';
      }
    } catch (error: any) {
      // A React internals change breaks the walk, not the agent: fall through
      // to the registry and say so in `error`.
      return {
        found: false,
        strategy: 'none',
        error: `fiber walk failed (${error?.message}); register the target with useAgentTarget()`,
      };
    }
  }

  if (!instance) {
    const fromRegistry = registry.get(testID);
    if (fromRegistry) {
      instance = fromRegistry;
      strategy = 'registry';
    }
  }

  if (!instance) {
    return { found: false, strategy: 'none' };
  }

  const rect = await measure(instance);
  if (!rect) {
    return {
      found: false,
      strategy,
      error:
        'element resolved but measureInWindow returned nothing (unmounted or zero-size?)',
    };
  }

  // RN measures in dp; Maestro's absolute `tapOn: point:` wants device pixels.
  // Getting this factor wrong lands every tap at a multiple of the real offset,
  // which is why the PoC calibrates it on each platform before trusting it.
  const scale = PixelRatio.get();
  const window = Dimensions.get('window');
  const centerXdp = rect.x + rect.width / 2;
  const centerYdp = rect.y + rect.height / 2;

  // A zero-area rect means the node is in the tree but not laid out —
  // react-navigation keeps previous screens mounted, so a testID from another
  // screen resolves happily and measures as nothing. Withhold the coordinates
  // rather than hand back (0,0): a caller that skips the onScreen check would
  // otherwise tap the corner of the screen and get a confusing failure far from
  // the cause.
  if (rect.width <= 0 || rect.height <= 0) {
    return {
      found: true,
      strategy,
      dp: rect,
      onScreen: false,
      opacity,
      error:
        'resolved in the React tree but has no layout (zero-size rect) — it is ' +
        'probably on a screen that is mounted but not visible',
    };
  }

  return {
    found: true,
    strategy,
    x: Math.round(centerXdp * scale),
    y: Math.round(centerYdp * scale),
    width: Math.round(rect.width * scale),
    height: Math.round(rect.height * scale),
    dp: rect,
    onScreen:
      centerXdp >= 0 &&
      centerYdp >= 0 &&
      centerXdp <= window.width &&
      centerYdp <= window.height,
    opacity,
  };
}
