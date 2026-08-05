import { createHash, createHmac, randomBytes } from "node:crypto";
import ipaddr from "ipaddr.js";

export const randomCredential = () => randomBytes(32).toString("base64url");
export const hashCredential = (credential: string) =>
  createHash("sha256").update(credential).digest("hex");

export function utcDate(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function normalizeIpPrefix(ip: string) {
  try {
    const parsed = ipaddr.parse(ip.split("%", 1)[0]);
    const address =
      parsed.kind() === "ipv6" && (parsed as ipaddr.IPv6).isIPv4MappedAddress()
        ? (parsed as ipaddr.IPv6).toIPv4Address()
        : parsed;
    if (address.kind() === "ipv4") {
      const [a, b, c] = (address as ipaddr.IPv4).octets;
      return `${a}.${b}.${c}.0/24`;
    }
    const parts = (address as ipaddr.IPv6).parts.slice(0, 4);
    return `${parts.map((part) => part.toString(16)).join(":")}::/64`;
  } catch {
    return "unknown";
  }
}

export function copyActorHash(secret: string, date: Date, ip: string) {
  return createHmac("sha256", secret)
    .update(`${date.toISOString().slice(0, 10)}:${normalizeIpPrefix(ip)}`)
    .digest("hex");
}

export type RequestAddress = {
  socketAddress?: string | null;
  forwardedFor?: string | null;
  cloudflareAddress?: string | null;
};

export type TrustedProxyMode = "none" | "forwarded" | "cloudflare";

export function trustedProxyMode(value = process.env.TOKENSHELF_TRUST_PROXY): TrustedProxyMode {
  const configured = value?.toLowerCase();
  if (configured === "cloudflare") return "cloudflare";
  if (configured === "forwarded" || configured === "true" || configured === "1") return "forwarded";
  return "none";
}

export function selectClientAddress(request: RequestAddress, trust: TrustedProxyMode) {
  const forwarded = request.forwardedFor?.split(",", 1)[0]?.trim();
  const candidate =
    trust === "cloudflare"
      ? request.cloudflareAddress
      : trust === "forwarded"
        ? forwarded
        : request.socketAddress;
  return normalizeAddress(candidate) ?? normalizeAddress(request.socketAddress) ?? "unknown";
}

function normalizeAddress(value: string | null | undefined) {
  if (!value) return null;
  try {
    return ipaddr.parse(value.split("%", 1)[0]).toString();
  } catch {
    return null;
  }
}
