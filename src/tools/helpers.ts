import { join, sep } from "path";
import { resolve, relative, isAbsolute } from "path";
import { stat, readFile, readdir } from "fs/promises";
import type { LMStudioClient } from "@lmstudio/sdk";
import { findLMStudioHome } from "../findLMStudioHome";

// ─── Path Safety ─────────────────────────────────────────────────────────────

/**
 * Resolve and validate a path is inside the workspace.
 * Optionally checks against a list of protected absolute paths that are
 * always off-limits regardless of CWD (from the protectedPaths config).
 */
export function validatePath(
  baseDir: string,
  requestedPath: string,
  protectedPaths: string[] = [],
): string {
  const resolved = resolve(baseDir, requestedPath);
  const rel = relative(baseDir, resolved);
  if (rel.startsWith("..") || isAbsolute(rel)) {
    throw new Error(`Access Denied: Path '${requestedPath}' is outside the workspace.`);
  }
  for (const blocked of protectedPaths) {
    if (resolved === blocked || resolved.startsWith(blocked + sep)) {
      throw new Error(`Access Denied: '${resolved}' is within a protected path ('${blocked}').`);
    }
  }
  return resolved;
}

/**
 * Parse the raw protectedPaths config string (newline- or comma-separated
 * paths) into a list of resolved absolute path strings.
 */
export function parseProtectedPaths(raw: string): string[] {
  return raw
    .split(/[\n,]/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => resolve(p));     // expand ~ would require os.homedir(); resolve handles absolute paths
}

// ─── SSRF-safe fetch ─────────────────────────────────────────────────────────

const MAX_REDIRECT_HOPS = 5;

/**
 * Returns true if the given IP string (IPv4 dotted-quad or bare IPv6) refers
 * to a loopback, private, link-local, or otherwise special-purpose address
 * that must not be reached from the server side.
 *
 * Exported so it can be unit-tested independently.
 */
export function isBlockedIp(ip: string): boolean {
  const n = ip.toLowerCase();

  // IPv4-mapped IPv6 (e.g. ::ffff:127.0.0.1) — extract and recurse
  const mapped = n.match(/^::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
  if (mapped) return isBlockedIp(mapped[1]);

  // ── IPv6 special ranges ──────────────────────────────────────────────────
  if (n === "::1") return true;                         // loopback
  if (n.startsWith("fe80")) return true;                // link-local fe80::/10
  if (n.startsWith("fc") || n.startsWith("fd")) return true; // ULA fc00::/7 (full range)

  // ── IPv4 dotted-quad ─────────────────────────────────────────────────────
  const quad = n.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (quad) {
    const [a, b, c] = [Number(quad[1]), Number(quad[2]), Number(quad[3])];
    return (
      a === 0 ||                                        // 0.x.x.x — "this" network
      a === 10 ||                                       // 10/8 — RFC-1918
      a === 127 ||                                      // 127/8 — loopback
      (a === 100 && b >= 64 && b <= 127) ||            // 100.64–127/10 — CGNAT RFC-6598
      (a === 169 && b === 254) ||                       // 169.254/16 — link-local / cloud metadata
      (a === 172 && b >= 16 && b <= 31) ||             // 172.16–31/12 — RFC-1918
      (a === 192 && b === 0 && c === 2) ||             // 192.0.2/24 — TEST-NET-1
      (a === 192 && b === 168) ||                       // 192.168/16 — RFC-1918
      (a === 198 && b >= 18 && b <= 19) ||             // 198.18–19/15 — benchmarking (was: a===198 over-block)
      (a === 198 && b === 51 && c === 100) ||          // 198.51.100/24 — TEST-NET-2
      (a === 203 && b === 0 && c === 113) ||           // 203.0.113/24 — TEST-NET-3
      a >= 224                                          // 224+ — multicast / reserved
    );
  }

  return false;
}

/**
 * Parse and validate a URL for SSRF safety.  Checks scheme, parses the URL,
 * and rejects any hostname that is localhost, 0.0.0.0, or maps to a blocked IP.
 *
 * Returns the parsed URL on success; throws on any violation.
 * Exported so it can be unit-tested independently.
 */
export function validateSsrfUrl(url: string): URL {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    throw new Error(`SSRF protection: only http:// and https:// URLs are allowed (got: ${url.slice(0, 80)}).`);
  }
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`Invalid URL: ${url.slice(0, 80)}`);
  }
  // Strip surrounding brackets from IPv6 (e.g. [::1] → ::1)
  const hostname = parsed.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (hostname === "localhost" || hostname === "0.0.0.0") {
    throw new Error(`SSRF protection: access to '${hostname}' is not allowed.`);
  }
  if (isBlockedIp(hostname)) {
    throw new Error(`SSRF protection: access to '${hostname}' is not allowed.`);
  }
  return parsed;
}

/**
 * Best-effort DNS pre-check: resolve the hostname and verify no returned
 * address falls in a blocked range.  This catches misconfigured or malicious
 * internal DNS records.
 *
 * Note: there is an unavoidable TOCTOU window between this check and the
 * actual fetch — DNS rebinding attacks can still succeed.  This is documented
 * in SECURITY.md as a residual risk.
 *
 * Skipped for bare IP addresses (no lookup needed) and DNS resolution errors
 * (NXDOMAIN, timeout) so a flaky resolver doesn't break legitimate requests.
 */
async function checkDnsForSsrf(hostname: string): Promise<void> {
  // Skip if hostname is already a dotted-quad IPv4 or contains a colon (IPv6)
  if (/^[\d.]+$/.test(hostname) || hostname.includes(":")) return;
  const dns = await import("dns");
  try {
    const addresses = await dns.promises.lookup(hostname, { all: true });
    for (const { address } of addresses) {
      if (isBlockedIp(address.toLowerCase())) {
        throw new Error(
          `SSRF protection: hostname '${hostname}' resolves to blocked address '${address}'.`
        );
      }
    }
  } catch (e) {
    // Re-throw only our own SSRF errors; swallow all DNS failures
    if (e instanceof Error && e.message.startsWith("SSRF protection:")) throw e;
    // DNS failure (NXDOMAIN, timeout, etc.) — let fetch proceed; residual risk documented
  }
}

/**
 * Internal recursive helper that performs a single fetch hop with
 * redirect: "manual", then re-validates any redirect Location before
 * following it.  This closes the redirect-bypass SSRF vector (SEC-R1).
 */
async function safeFetchHop(
  url: string,
  options: RequestInit & { timeoutMs?: number },
  hopCount: number,
): Promise<Response> {
  const parsed = validateSsrfUrl(url);
  await checkDnsForSsrf(parsed.hostname);

  const { timeoutMs = 30_000, signal: callerSignal, ...fetchOptions } = options;
  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  const signal = callerSignal
    ? AbortSignal.any([callerSignal, timeoutSignal])
    : timeoutSignal;

  const response = await fetch(url, { ...fetchOptions, signal, redirect: "manual" });

  if (response.status >= 300 && response.status < 400) {
    if (hopCount >= MAX_REDIRECT_HOPS) {
      throw new Error(`SSRF protection: too many redirects (max ${MAX_REDIRECT_HOPS}).`);
    }
    const location = response.headers.get("location");
    if (!location) throw new Error("Redirect response missing Location header.");
    const redirectUrl = new URL(location, url).toString();
    return safeFetchHop(redirectUrl, options, hopCount + 1);
  }

  return response;
}

/**
 * A drop-in replacement for `fetch()` that:
 *  - Enforces http/https scheme only
 *  - Blocks requests to loopback, private RFC-1918, link-local (cloud
 *    metadata), and other special-purpose address ranges (SSRF protection)
 *  - Re-validates every redirect hop to prevent open-redirect bypass attacks
 *  - Performs a best-effort DNS pre-check for internal hostnames
 *  - Applies a configurable timeout via AbortSignal (default 30 s)
 *
 * Throws on SSRF violations so callers can return a clean { error } message.
 */
export async function safeFetch(
  url: string,
  options: RequestInit & { timeoutMs?: number } = {},
): Promise<Response> {
  return safeFetchHop(url, options, 0);
}

// ─── Path Heuristics ──────────────────────────────────────────────────────────

export function extractLikelyFilePath(text: string): string | null {
  const isPlausiblePath = (value: string): boolean => {
    const candidate = value.trim();
    if (!candidate) return false;
    if (/[,\r\n]/.test(candidate)) return false;
    if (candidate.includes("=") && !candidate.includes("\\") && !candidate.includes("/")) return false;
    if (/[<>|*?]/.test(candidate)) return false;
    const extensionMatch = candidate.match(/\.([A-Za-z0-9_-]{1,15})$/);
    if (!extensionMatch) return false;
    const extension = extensionMatch[1];
    if (!/[A-Za-z]/.test(extension)) return false;
    return true;
  };

  const patterns = [
    /['"]([A-Za-z]:\\[^'"\r\n]+)['"]/,
    /\b([A-Za-z]:\\[^\s'"]+(?:\.[A-Za-z0-9_-]+)?)\b/,
    /['"]((?:\.{0,2}[\\/])?[^'"\r\n]+\.[A-Za-z0-9_-]+)['"]/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match?.[1]) continue;
    const candidate = match[1].replace(/[),.;]+$/, "").trim();
    if (!isPlausiblePath(candidate)) continue;
    return candidate;
  }
  return null;
}

// ─── Permission Guard ─────────────────────────────────────────────────────────

export const createSafeToolImplementation = <TParameters, TReturn>(
  originalImplementation: (params: TParameters) => Promise<TReturn>,
  isEnabled: boolean,
  toolName: string,
) => async (params: TParameters): Promise<TReturn> => {
  if (!isEnabled) {
    throw new Error(
      `Tool '${toolName}' is disabled in the plugin settings. Please ask the user to enable 'Allow ${toolName.replace(/_/g, " ")}' (or similar) in the settings.`
    );
  }
  return originalImplementation(params);
};

// ─── RAG / Embeddings ─────────────────────────────────────────────────────────

/**
 * Module-level embedding cache for rag_local_files (PERF-2).
 *
 * Keyed by absolute file path.  Each entry stores the file's mtime at the
 * time it was embedded plus the chunk strings and their embedding vectors.
 * Before embedding a file we stat() it — if the mtime hasn't changed since
 * the last embed we reuse the cached vectors, paying only for the query embed.
 *
 * The cache lives for the lifetime of the plugin process (never evicted).
 * Deleted files are harmless — their path simply won't be found in future
 * readdir() scans.  Modified files are detected via mtime.
 */
interface EmbeddingCacheEntry {
  mtime: number;
  chunks: string[];
  embeddings: number[][];
}
const _embeddingCache = new Map<string, EmbeddingCacheEntry>();

/** Shared binary extensions skipped by RAG scans. */
const BINARY_EXT_RE = /\.(png|jpg|jpeg|gif|ico|exe|dll|bin|pdf|docx|zip|tar|gz|wasm|node)$/i;

export type RagLocalResult = { file: string; score: number; content: string };

/**
 * Scan up to `maxFiles` text files under `targetDir`, embed them with the
 * given model (using a per-file mtime cache to skip unchanged files), and
 * return the top-scoring chunks for `query`.
 *
 * Both rag_local_files (miscTools) and the sub-agent copy call this instead
 * of duplicating the embed loop.
 */
export async function ragLocalFiles(opts: {
  query: string;
  targetDir: string;
  filePattern?: string;
  client: LMStudioClient;
  embeddingModelName: string;
  maxFiles?: number;
  minScore?: number;
  topK?: number;
}): Promise<RagLocalResult[]> {
  const {
    query, targetDir, filePattern = "", client, embeddingModelName,
    maxFiles = 50, minScore = 0.4, topK = 10,
  } = opts;

  // 1. Discover candidate text files
  const entries = await readdir(targetDir, { recursive: true, withFileTypes: true });
  const candidates = entries
    .filter(e => {
      if (!e.isFile() || BINARY_EXT_RE.test(e.name)) return false;
      if (!filePattern) return true;
      const fullPath = join((e as any).parentPath ?? (e as any).path, e.name);
      return e.name.includes(filePattern) || fullPath.includes(filePattern);
    })
    .slice(0, maxFiles);

  // 2. Load the embedding model and embed the query
  const embeddingModel = await client.embedding.model(embeddingModelName);
  const [queryEmbedding] = await embeddingModel.embed([query]);

  // 3. Separate cache-hits from files that need (re-)embedding
  type FileMeta = { fullPath: string; name: string };
  const hits: FileMeta[] = [];
  const misses: FileMeta[] = [];

  await Promise.all(candidates.map(async e => {
    const fullPath = join((e as any).parentPath ?? (e as any).path, e.name);
    try {
      const mtime = (await stat(fullPath)).mtimeMs;
      const cached = _embeddingCache.get(fullPath);
      if (cached && cached.mtime === mtime) {
        hits.push({ fullPath, name: e.name });
      } else {
        misses.push({ fullPath, name: e.name });
      }
    } catch {
      // unreadable / deleted — skip
    }
  }));

  // 4. Batch-embed all cache-miss files
  for (const { fullPath, name } of misses) {
    try {
      const content = await readFile(fullPath, "utf-8");
      const chunks = content.split(/\n\s*\n/).filter(c => c.trim().length > 20);
      if (chunks.length === 0) continue;
      const embeddings = await embeddingModel.embed(chunks);
      const mtime = (await stat(fullPath)).mtimeMs;
      _embeddingCache.set(fullPath, {
        mtime,
        chunks,
        embeddings: embeddings.map((e: { embedding: number[] }) => e.embedding),
      });
      hits.push({ fullPath, name });
    } catch {
      // skip unreadable files
    }
  }

  // 5. Score all cached chunks against the query
  const allChunks: RagLocalResult[] = [];
  for (const { fullPath, name } of hits) {
    const cached = _embeddingCache.get(fullPath);
    if (!cached) continue;
    cached.chunks.forEach((chunk, i) => {
      const score = cosineSimilarity(queryEmbedding.embedding, cached.embeddings[i]);
      if (score > minScore) allChunks.push({ file: name, score, content: chunk });
    });
  }

  allChunks.sort((a, b) => b.score - a.score);
  return allChunks.slice(0, topK);
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
  const magB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
  if (magA === 0 || magB === 0) return 0;
  return dotProduct / (magA * magB);
}

export async function performRagOnText(
  text: string,
  query: string,
  client: LMStudioClient,
  embeddingModelName: string
) {
  const embeddingModel = await client.embedding.model(embeddingModelName);
  const chunks = text.split(/\n\s*\n/).filter(chunk => chunk.trim().length > 20);
  if (chunks.length === 0) {
    return [{ chunk: text.substring(0, 4000), score: 1 }];
  }

  const [queryEmbedding] = await embeddingModel.embed([query]);
  const chunkEmbeddings = await embeddingModel.embed(chunks);

  const similarities = chunkEmbeddings.map((chunkEmb, i) => ({
    chunk: chunks[i],
    score: cosineSimilarity(queryEmbedding.embedding, chunkEmb.embedding),
  }));

  similarities.sort((a, b) => b.score - a.score);
  return similarities.slice(0, 5);
}

// ─── Deno Runtime ─────────────────────────────────────────────────────────────

export function getDenoPath(): string {
  const lmstudioHome = findLMStudioHome();
  const utilPath = join(lmstudioHome, ".internal", "utils");
  return join(utilPath, process.platform === "win32" ? "deno.exe" : "deno");
}

// ─── Python Runtime ───────────────────────────────────────────────────────────

let _cachedPythonPath: string | null = null;

/**
 * Resolve the Python 3 binary on the current platform, caching the result.
 * Tries `python3` first (macOS/Linux), then `python` (Windows / some distros).
 * Throws if no Python 3 interpreter is found.
 */
export async function getPythonPath(): Promise<string> {
  if (_cachedPythonPath) return _cachedPythonPath;

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { execFile } = require("child_process") as typeof import("child_process");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { promisify } = require("util") as typeof import("util");
  const execFileAsync = promisify(execFile);

  const candidates = process.platform === "win32"
    ? ["python", "python3"]   // Windows usually has "python" from Store / pyenv
    : ["python3", "python"];  // Unix: prefer explicit python3

  for (const candidate of candidates) {
    try {
      const { stdout, stderr } = await execFileAsync(candidate, ["--version"]);
      // Python 2 prints to stderr; Python 3 prints to stdout.
      const version = (stdout + stderr).trim();
      if (version.startsWith("Python 3")) {
        _cachedPythonPath = candidate;
        return candidate;
      }
    } catch {
      // Not found or not executable — try next candidate.
    }
  }

  throw new Error(
    "Python 3 interpreter not found. " +
    "Install Python 3 and ensure 'python3' or 'python' is on your PATH."
  );
}
