export function normalizeTagKey(value: string) {
  return normalizeTagLabel(value).toLowerCase();
}

export function normalizeTagLabel(value: string) {
  return value.normalize("NFKC").trim().replace(/\s+/g, " ");
}

export function normalizeTags(values: string[]) {
  const tags = new Map<string, string>();
  for (const value of values) {
    const label = normalizeTagLabel(value);
    const key = normalizeTagKey(label);
    if (key && !tags.has(key)) tags.set(key, label);
  }
  return [...tags.values()];
}
