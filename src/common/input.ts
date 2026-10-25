export function pickFields(input: Record<string, unknown>, fields: string[]) {
  return Object.fromEntries(fields.filter((field) => Object.prototype.hasOwnProperty.call(input, field)).map((field) => [field, input[field]]));
}
