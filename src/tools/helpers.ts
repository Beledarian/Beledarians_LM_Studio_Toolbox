import { join } from "path";
import { resolve, relative, isAbsolute } from "path";
import type { LMStudioClient } from "@lmstudio/sdk";
import { findLMStudioHome } from "../findLMStudioHome";

// ─── Path Safety ─────────────────────────────────────────────────────────────

export function validatePath(baseDir: string, requestedPath: string): string {
  const resolved = resolve(baseDir, requestedPath);
  const rel = relative(baseDir, resolved);
  if (rel.startsWith("..") || isAbsolute(rel)) {
    throw new Error(`Access Denied: Path '${requestedPath}' is outside the workspace.`);
  }
  return resolved;
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
