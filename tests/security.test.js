"use strict";
const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const os = require("node:os");

// We import from dist/ — build must be run before tests.
const { validatePath, parseProtectedPaths, safeFetch, isBlockedIp, validateSsrfUrl } = require("../dist/tools/helpers.js");

// ─── validatePath ────────────────────────────────────────────────────────────

describe("validatePath", () => {
  const base = path.join(os.tmpdir(), "toolbox-test-base");

  it("allows paths inside workspace", () => {
    const result = validatePath(base, "subdir/file.txt");
    assert.ok(result.startsWith(base));
  });

  it("blocks traversal outside workspace", () => {
    assert.throws(
      () => validatePath(base, "../../etc/passwd"),
      /Access Denied/
    );
  });

  it("blocks absolute paths outside workspace", () => {
    assert.throws(
      () => validatePath(base, "/etc/passwd"),
      /Access Denied/
    );
  });

  it("allows paths inside workspace with protectedPaths empty", () => {
    const result = validatePath(base, "file.txt", []);
    assert.ok(result.startsWith(base));
  });

  it("blocks path within a protected directory", () => {
    const protected1 = path.join(base, "secret");
    assert.throws(
      () => validatePath(base, "secret/data.txt", [protected1]),
      /protected path/
    );
  });

  it("blocks path equal to a protected directory exactly", () => {
    const protected1 = path.join(base, "secret");
    assert.throws(
      () => validatePath(base, "secret", [protected1]),
      /protected path/
    );
  });

  it("allows sibling of a protected directory", () => {
    const protected1 = path.join(base, "secret");
    const result = validatePath(base, "notSecret/file.txt", [protected1]);
    assert.ok(result.includes("notSecret"));
  });
});

// ─── parseProtectedPaths ─────────────────────────────────────────────────────

describe("parseProtectedPaths", () => {
  it("returns empty array for empty string", () => {
    assert.deepEqual(parseProtectedPaths(""), []);
  });

  it("parses newline-separated paths", () => {
    const result = parseProtectedPaths("/tmp/a\n/tmp/b");
    assert.equal(result.length, 2);
    assert.ok(result[0].includes("a"));
    assert.ok(result[1].includes("b"));
  });

  it("parses comma-separated paths", () => {
    const result = parseProtectedPaths("/tmp/a,/tmp/b");
    assert.equal(result.length, 2);
  });

  it("trims whitespace and ignores blank entries", () => {
    const result = parseProtectedPaths("  /tmp/a  \n\n  /tmp/b  \n");
    assert.equal(result.length, 2);
  });
});

// ─── safeFetch — SSRF protection ─────────────────────────────────────────────

describe("safeFetch SSRF protection", () => {
  it("rejects non-http/https scheme (ftp://)", async () => {
    await assert.rejects(
      () => safeFetch("ftp://example.com/file"),
      /only http.*https.*allowed/i
    );
  });

  it("rejects file:// scheme", async () => {
    await assert.rejects(
      () => safeFetch("file:///etc/passwd"),
      /only http.*https.*allowed/i
    );
  });

  it("rejects localhost", async () => {
    await assert.rejects(
      () => safeFetch("http://localhost/api"),
      /SSRF protection/
    );
  });

  it("rejects 127.0.0.1 (loopback)", async () => {
    await assert.rejects(
      () => safeFetch("http://127.0.0.1:8080/"),
      /SSRF protection/
    );
  });

  it("rejects 127.x.x.x range", async () => {
    await assert.rejects(
      () => safeFetch("http://127.0.0.2/"),
      /SSRF protection/
    );
  });

  it("rejects 10.x.x.x (RFC-1918)", async () => {
    await assert.rejects(
      () => safeFetch("http://10.0.0.1/"),
      /SSRF protection/
    );
  });

  it("rejects 172.16.x.x (RFC-1918)", async () => {
    await assert.rejects(
      () => safeFetch("http://172.16.0.1/"),
      /SSRF protection/
    );
  });

  it("rejects 192.168.x.x (RFC-1918)", async () => {
    await assert.rejects(
      () => safeFetch("http://192.168.1.1/"),
      /SSRF protection/
    );
  });

  it("rejects 169.254.x.x (link-local / cloud metadata)", async () => {
    await assert.rejects(
      () => safeFetch("http://169.254.169.254/latest/meta-data/"),
      /SSRF protection/
    );
  });

  it("rejects IPv6 loopback ::1", async () => {
    await assert.rejects(
      () => safeFetch("http://[::1]/"),
      /SSRF protection/
    );
  });

  it("rejects IPv6 link-local fe80::", async () => {
    await assert.rejects(
      () => safeFetch("http://[fe80::1]/"),
      /SSRF protection/
    );
  });

  it("does not reject a normal public URL (no actual request)", async () => {
    // We don't actually send the request — we just verify safeFetch doesn't
    // throw before the network call by aborting immediately.
    const ac = new AbortController();
    ac.abort();
    try {
      await safeFetch("https://example.com/", { signal: ac.signal });
    } catch (e) {
      // AbortError is expected — the SSRF check must have passed
      assert.ok(
        e.name === "AbortError" || e.name === "TimeoutError" || e.code === "ABORT_ERR",
        `Expected AbortError, got ${e.name}: ${e.message}`
      );
    }
  });

  // SEC-R1: redirect-bypass — mock global.fetch to return a 302 pointing at
  // a private IP without making any real network call.
  it("rejects redirect to private IP (SEC-R1 redirect bypass)", async () => {
    const originalFetch = global.fetch;
    global.fetch = async (_url, _options) => {
      return new Response("", {
        status: 302,
        headers: { "Location": "http://169.254.169.254/latest/meta-data/" },
      });
    };
    try {
      await safeFetch("https://example.com/");
      assert.fail("Should have thrown an SSRF error");
    } catch (e) {
      assert.ok(
        e.message.includes("SSRF") && e.message.includes("169.254"),
        `Expected SSRF error mentioning 169.254, got: ${e.message}`
      );
    } finally {
      global.fetch = originalFetch;
    }
  });

  it("rejects redirect chain exceeding max hops", async () => {
    const originalFetch = global.fetch;
    global.fetch = async (url, _options) => {
      // Always redirect to a different (but public) URL to exhaust hop count
      return new Response("", {
        status: 302,
        headers: { "Location": `https://example.com/hop?t=${Date.now()}` },
      });
    };
    try {
      await safeFetch("https://example.com/start");
      assert.fail("Should have thrown a too-many-redirects error");
    } catch (e) {
      assert.ok(
        e.message.includes("too many redirects"),
        `Expected too-many-redirects error, got: ${e.message}`
      );
    } finally {
      global.fetch = originalFetch;
    }
  });
});

// ─── isBlockedIp unit tests ───────────────────────────────────────────────────

describe("isBlockedIp", () => {
  // IPv4 blocked ranges
  it("blocks 127.0.0.1 (loopback)", () => assert.ok(isBlockedIp("127.0.0.1")));
  it("blocks 10.0.0.1 (RFC-1918)", () => assert.ok(isBlockedIp("10.0.0.1")));
  it("blocks 172.16.0.1 (RFC-1918)", () => assert.ok(isBlockedIp("172.16.0.1")));
  it("blocks 172.31.255.255 (RFC-1918 upper)", () => assert.ok(isBlockedIp("172.31.255.255")));
  it("blocks 192.168.1.1 (RFC-1918)", () => assert.ok(isBlockedIp("192.168.1.1")));
  it("blocks 169.254.169.254 (link-local/metadata)", () => assert.ok(isBlockedIp("169.254.169.254")));
  it("blocks 100.64.0.1 (CGNAT)", () => assert.ok(isBlockedIp("100.64.0.1")));
  it("blocks 192.0.2.1 (TEST-NET-1)", () => assert.ok(isBlockedIp("192.0.2.1")));
  it("blocks 198.18.0.1 (benchmarking)", () => assert.ok(isBlockedIp("198.18.0.1")));
  it("blocks 198.19.255.255 (benchmarking upper)", () => assert.ok(isBlockedIp("198.19.255.255")));
  it("blocks 198.51.100.0 (TEST-NET-2)", () => assert.ok(isBlockedIp("198.51.100.0")));
  it("blocks 203.0.113.1 (TEST-NET-3)", () => assert.ok(isBlockedIp("203.0.113.1")));
  it("blocks 224.0.0.1 (multicast)", () => assert.ok(isBlockedIp("224.0.0.1")));

  // IPv4 allowed ranges — SEC-R5 regression (198/8 over-block fix)
  it("allows 198.41.0.4 (public IP, was over-blocked by a===198)", () => assert.ok(!isBlockedIp("198.41.0.4")));
  it("allows 198.20.0.1 (public, between benchmarking and TEST-NET-2)", () => assert.ok(!isBlockedIp("198.20.0.1")));
  it("allows 8.8.8.8 (Google DNS)", () => assert.ok(!isBlockedIp("8.8.8.8")));
  it("allows 1.1.1.1 (Cloudflare DNS)", () => assert.ok(!isBlockedIp("1.1.1.1")));
  it("allows 172.32.0.1 (just above RFC-1918 block)", () => assert.ok(!isBlockedIp("172.32.0.1")));

  // IPv6 blocked ranges
  it("blocks ::1 (IPv6 loopback)", () => assert.ok(isBlockedIp("::1")));
  it("blocks fe80::1 (link-local)", () => assert.ok(isBlockedIp("fe80::1")));
  it("blocks fd00::1 (ULA fd)", () => assert.ok(isBlockedIp("fd00::1")));
  // SEC-R3: full ULA range fc00::/7 (fc01–fcff were missed by old check)
  it("blocks fc00::1 (ULA fc00, was checked)", () => assert.ok(isBlockedIp("fc00::1")));
  it("blocks fc01::1 (ULA fc01, was MISSED by old startsWith('fc00'))", () => assert.ok(isBlockedIp("fc01::1")));
  it("blocks fcff::1 (ULA fcff, was MISSED by old check)", () => assert.ok(isBlockedIp("fcff::1")));

  // IPv4-mapped IPv6 (SEC-R4 / ::ffff: prefix)
  it("blocks ::ffff:127.0.0.1 (IPv4-mapped loopback)", () => assert.ok(isBlockedIp("::ffff:127.0.0.1")));
  it("blocks ::ffff:192.168.1.1 (IPv4-mapped RFC-1918)", () => assert.ok(isBlockedIp("::ffff:192.168.1.1")));
  it("blocks ::ffff:169.254.169.254 (IPv4-mapped metadata)", () => assert.ok(isBlockedIp("::ffff:169.254.169.254")));

  // IPv6 allowed
  it("allows 2606:4700::1111 (Cloudflare public IPv6)", () => assert.ok(!isBlockedIp("2606:4700::1111")));
});
