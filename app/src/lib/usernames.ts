export function normalizePublicUsername(value: string) {
  const username = value.trim().replace(/^@/, "").toLowerCase();
  return /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/.test(username) ? username : null;
}
