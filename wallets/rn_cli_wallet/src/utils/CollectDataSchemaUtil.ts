// Parses the identity-collection (IC) payload from `collectData` into a
// normalized, render-ready field list for the in-app web form.
//
// The backend sends two things:
//   - `fields`: a minimal hint list (often just a couple of entries)
//   - `schema`: a JSON-Schema *string* describing the FULL set of properties,
//     which fields are required, and an `anyOf` (either/or) constraint.
//
// We drive the form off `schema` (the complete source of truth) and fall back
// to `fields` only when the schema is absent or unparseable.
import type { CollectDataField } from '@walletconnect/pay';

export type CollectControl = 'text' | 'date' | 'country' | 'checkbox';

export interface CollectFieldDescriptor {
  id: string;
  /** Display label — the schema property `title`, else the field name, else id. */
  label: string;
  description?: string;
  control: CollectControl;
  /** Listed in the schema's top-level `required` array. */
  required: boolean;
  maxLength?: number;
}

export interface ParsedCollectData {
  /** Ordered input fields to render (excludes the consent checkbox). */
  fields: CollectFieldDescriptor[];
  /** The boolean/`const: true` field (e.g. `tosConfirmed`), surfaced as a consent box. */
  consent: CollectFieldDescriptor | null;
  /** Each entry is a set of field ids that together satisfy one `anyOf` branch. */
  anyOfGroups: string[][];
  /** Top-level required field ids (excluding consent). */
  requiredIds: string[];
}

interface JsonSchemaProperty {
  type?: string;
  format?: string;
  title?: string;
  description?: string;
  pattern?: string;
  maxLength?: number;
  const?: unknown;
}

interface JsonSchema {
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
  anyOf?: Array<{ required?: string[] }>;
}

const COUNTRY_CODE_PATTERN = '^[A-Z]{2}$';

function controlFor(key: string, prop: JsonSchemaProperty): CollectControl {
  if (prop.type === 'boolean' || prop.const === true) {
    return 'checkbox';
  }
  if (prop.format === 'date') {
    return 'date';
  }
  if (prop.pattern === COUNTRY_CODE_PATTERN || /country$/i.test(key)) {
    return 'country';
  }
  return 'text';
}

function parseFromSchema(
  schema: JsonSchema,
  fields?: CollectDataField[],
): ParsedCollectData | null {
  const properties = schema.properties;
  if (!properties || typeof properties !== 'object') {
    return null;
  }

  const nameById = new Map<string, string>(
    (fields ?? []).map(f => [f.id, f.name]),
  );
  const required = Array.isArray(schema.required) ? schema.required : [];

  const byId: Record<string, CollectFieldDescriptor> = {};
  for (const [key, prop] of Object.entries(properties)) {
    byId[key] = {
      id: key,
      label: prop.title || nameById.get(key) || key,
      description: prop.description,
      control: controlFor(key, prop),
      required: required.includes(key),
      maxLength: prop.maxLength,
    };
  }

  const consent =
    Object.values(byId).find(d => d.control === 'checkbox') ?? null;

  // Order: top-level required first (matches the schema's required order, e.g.
  // fullName, dob), then remaining properties in declaration order.
  const ordered: string[] = [];
  const addField = (id: string) => {
    const d = byId[id];
    if (d && d.control !== 'checkbox' && !ordered.includes(id)) {
      ordered.push(id);
    }
  };
  required.forEach(addField);
  Object.keys(properties).forEach(addField);

  const anyOfGroups = (Array.isArray(schema.anyOf) ? schema.anyOf : [])
    .map(branch => (Array.isArray(branch?.required) ? branch.required : []))
    .filter(group => group.length > 0);

  return {
    fields: ordered.map(id => byId[id]),
    consent,
    anyOfGroups,
    requiredIds: ordered.filter(id => byId[id].required),
  };
}

function parseFromFields(fields: CollectDataField[]): ParsedCollectData {
  const descriptors = fields.map<CollectFieldDescriptor>(f => ({
    id: f.id,
    label: f.name,
    control:
      f.fieldType === 'date'
        ? 'date'
        : f.fieldType === 'checkbox'
        ? 'checkbox'
        : 'text',
    required: f.required,
  }));

  const consent = descriptors.find(d => d.control === 'checkbox') ?? null;
  const inputs = descriptors.filter(d => d.control !== 'checkbox');

  return {
    fields: inputs,
    consent,
    anyOfGroups: [],
    requiredIds: inputs.filter(d => d.required).map(d => d.id),
  };
}

/**
 * Normalizes `collectData` into render-ready fields. Prefers the JSON schema;
 * falls back to the `fields` hint list when the schema is missing/invalid.
 */
export function parseCollectData(
  schemaString?: string,
  fields?: CollectDataField[],
): ParsedCollectData {
  if (schemaString) {
    try {
      const parsed = parseFromSchema(JSON.parse(schemaString), fields);
      if (parsed) {
        return parsed;
      }
    } catch {
      // Fall through to the fields-based fallback below.
    }
  }
  return parseFromFields(fields ?? []);
}

function isFilled(value: string | undefined): boolean {
  return !!value && value.trim().length > 0;
}

export interface CollectValidation {
  valid: boolean;
  message: string | null;
}

/**
 * Validates collected values against the parsed schema:
 *   - all top-level required fields filled
 *   - consent checked (when a consent field exists)
 *   - at least one `anyOf` branch fully satisfied (when any exist)
 */
export function validateCollectData(
  parsed: ParsedCollectData,
  values: Record<string, string>,
  consentChecked: boolean,
): CollectValidation {
  const labelOf = (id: string) =>
    parsed.fields.find(f => f.id === id)?.label ?? id;

  const missing = parsed.requiredIds.filter(id => !isFilled(values[id]));
  if (missing.length > 0) {
    return {
      valid: false,
      message: `Please complete: ${missing.map(labelOf).join(', ')}`,
    };
  }

  const anyOfSatisfied =
    parsed.anyOfGroups.length === 0 ||
    parsed.anyOfGroups.some(group => group.every(id => isFilled(values[id])));
  if (!anyOfSatisfied) {
    const options = parsed.anyOfGroups
      .map(group => group.map(labelOf).join(' + '))
      .join('  or  ');
    return {
      valid: false,
      message: `Please complete one of: ${options}`,
    };
  }

  if (parsed.consent && !consentChecked) {
    return { valid: false, message: 'Please accept the terms to continue.' };
  }

  return { valid: true, message: null };
}
