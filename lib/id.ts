export function createId(prefix = "key"): string {
  return `${prefix}-${crypto.randomUUID()}`
}
