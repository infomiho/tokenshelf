import { describe, expect, it } from "vitest";
import { copyActorHash, normalizeIpPrefix, selectClientAddress, utcDate } from "./security";

describe("copy analytics identity", () => {
  it("normalizes IP prefixes and produces one stable daily actor hash", () => {
    const date = utcDate(new Date("2026-08-03T18:00:00Z"));
    expect(normalizeIpPrefix("192.0.2.42")).toBe("192.0.2.0/24");
    expect(copyActorHash("secret", date, "192.0.2.42")).toBe(
      copyActorHash("secret", date, "192.0.2.99"),
    );
    expect(copyActorHash("secret", date, "192.0.3.1")).not.toBe(
      copyActorHash("secret", date, "192.0.2.42"),
    );
    expect(normalizeIpPrefix("::ffff:192.0.2.42")).toBe("192.0.2.0/24");
    expect(normalizeIpPrefix("2001:db8:abcd:12:1:2:3:4")).toBe("2001:db8:abcd:12::/64");
    expect(normalizeIpPrefix("999.1.1.1")).toBe("unknown");
  });

  it("only accepts deployment headers when their proxy mode is configured", () => {
    const request = {
      socketAddress: "192.0.2.10",
      forwardedFor: "198.51.100.7, 192.0.2.10",
      cloudflareAddress: "203.0.113.9",
    };
    expect(selectClientAddress(request, "none")).toBe("192.0.2.10");
    expect(selectClientAddress(request, "forwarded")).toBe("198.51.100.7");
    expect(selectClientAddress(request, "cloudflare")).toBe("203.0.113.9");
    expect(selectClientAddress({ ...request, cloudflareAddress: "not-an-ip" }, "cloudflare")).toBe(
      "192.0.2.10",
    );
  });
});
