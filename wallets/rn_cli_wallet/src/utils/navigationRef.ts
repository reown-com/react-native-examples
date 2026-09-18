import { createNavigationContainerRef } from '@react-navigation/native';

import type { RootStackParamList } from '@/utils/TypesUtil';

/**
 * Imperative handle on the navigation tree.
 *
 * The app navigates through `useNavigation()` everywhere, which is only
 * reachable from inside a component. The dev agent runs outside the React tree,
 * so it needs this ref to drive navigation. Attached in `src/screens/App.tsx`.
 */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();
