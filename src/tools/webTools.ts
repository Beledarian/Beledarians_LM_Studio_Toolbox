import { tool, type Tool } from "@lmstudio/sdk";
import { z } from "zod";
import type { ToolContext } from "./context";
import { createSafeToolImplementation, performRagOnText, safeFetch } from "./helpers";
type SearchProvider = "duckduckgo-api" | "duckduckgo-fetch" | "duckduckgo-html" | "google" | "bing";
type SearchResult = { title: string; link: string; snippet: string; provider: SearchProvider };

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

function stripHtml(value: string) {
  return decodeHtmlEntities(value).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeDuckDuckGoLink(link: string): string {
  const decoded = decodeHtmlEntities(link);
  const absolute = decoded.startsWith("//") ? `https:${decoded}`
    : decoded.startsWith("/") ? `https://duckduckgo.com${decoded}` : decoded;
  try {
    const parsed = new URL(absolute);
    const redirect = parsed.searchParams.get("uddg");
    if (redirect) return decodeURIComponent(redirect);
  } catch { /* ignore */ }
  return absolute;
}

function parseDuckDuckGoHtml(html: string, provider: "duckduckgo-fetch" | "duckduckgo-html"): SearchResult[] {
  const results: SearchResult[] = [];
  const titleRegex = /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;
  while ((match = titleRegex.exec(html)) !== null) {
    const link = normalizeDuckDuckGoLink(match[1]);
    const title = stripHtml(match[2]);
    const nearbyHtml = html.slice(match.index, Math.min(html.length, match.index + 1800));
    const snippetMatch = nearbyHtml.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/(?:a|div)>/i);
    const snippet = snippetMatch ? stripHtml(snippetMatch[1]) : "";
    if (title && link) results.push({ title, link, snippet, provider });
    if (results.length >= 10) break;
  }
  return results;
}

export function createWebTools(ctx: ToolContext): Tool[] {
  const tools: Tool[] = [];

  tools.push(tool({
    name: "web_search",
    description: "Search the web using multiple providers (DuckDuckGo, Google, Bing). Uses no-key, no-Chrome providers first, then browser providers as fallback.",
    parameters: {
      query: z.string(),
      providers: z.array(z.enum(["duckduckgo-api", "duckduckgo-fetch", "duckduckgo-html", "google", "bing"]))
        .optional()
        .describe("Optional: List of specific providers. If omitted, fallback chain is: DDG Fetch -> DDG API -> DDG browser -> Google -> Bing."),
    },
    implementation: async ({ query, providers }) => {
      const results: SearchResult[] = [];
      const errors: string[] = [];
      const logs: string[] = [];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let sharedBrowser: any = null;
      const getBrowser = async () => {
        if (!sharedBrowser) {
          const puppeteer = await import("puppeteer");
          sharedBrowser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
        }
        return sharedBrowser!;
      };

      const searchFunctions: Record<SearchProvider, (q: string) => Promise<SearchResult[]>> = {
        "duckduckgo-api": async (q) => {
          const { search, SafeSearchType } = await import("duck-duck-scrape");
          let attempt = 0, lastError: unknown = null;
          while (attempt < 2) {
            try {
              const r = await search(q, { safeSearch: SafeSearchType.OFF });
              if (r.results?.length > 0) {
                return r.results.slice(0, 10).map((result: any) => ({
                  title: result.title, link: result.url, snippet: result.description, provider: "duckduckgo-api" as const,
                }));
              }
              break;
            } catch (e) {
              lastError = e; attempt++;
              await new Promise(res => setTimeout(res, 1000));
            }
          }
          if (lastError) throw lastError;
          throw new Error("DuckDuckGo API returned no results");
        },

        "duckduckgo-fetch": async (q) => {
          const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
              "Accept-Language": "en-US,en;q=0.9",
            },
            signal: AbortSignal.timeout(15_000),
          });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const html = await response.text();
          const extracted = parseDuckDuckGoHtml(html, "duckduckgo-fetch");
          if (extracted.length > 0) return extracted;
          throw new Error("No results parsed from DuckDuckGo HTML");
        },

        "duckduckgo-html": async (q) => {
          const browser = await getBrowser();
          const page = await browser.newPage();
          try {
            await page.goto(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`, { waitUntil: "networkidle2", timeout: 15000 });
            const html = await page.content();
            const extracted = parseDuckDuckGoHtml(html, "duckduckgo-html");
            if (extracted.length > 0) return extracted;
            throw new Error("No results found");
          } finally {
            await page.close();
          }
        },

        "google": async (q) => {
          const browser = await getBrowser();
          const page = await browser.newPage();
          try {
            await page.goto(`https://www.google.com/search?q=${encodeURIComponent(q)}`, { waitUntil: "networkidle2", timeout: 15000 });
            const extracted = await page.evaluate(() => {
              const items = document.querySelectorAll("div.g");
              const data: any[] = [];
              for (const item of items) {
                const titleEl = item.querySelector("h3");
                const linkEl = item.querySelector("a");
                const snippetEl = item.querySelector('div[style*="-webkit-line-clamp"]') || item.querySelector("div.VwiC3b");
                if (titleEl && linkEl) {
                  data.push({ title: (titleEl as HTMLElement).innerText, link: linkEl.getAttribute("href") || "", snippet: snippetEl ? (snippetEl as HTMLElement).innerText : "", provider: "google" as const });
                }
              }
              return data;
            });
            if (extracted.length > 0) return extracted.slice(0, 10);
            throw new Error("No results found");
          } finally {
            await page.close();
          }
        },

        "bing": async (q) => {
          const browser = await getBrowser();
          const page = await browser.newPage();
          try {
            await page.goto(`https://www.bing.com/search?q=${encodeURIComponent(q)}`, { waitUntil: "networkidle2", timeout: 15000 });
            const extracted = await page.evaluate(() => {
              const items = document.querySelectorAll("li.b_algo");
              const data: any[] = [];
              for (const item of items) {
                const titleEl = item.querySelector("h2 a");
                const snippetEl = item.querySelector("p");
                if (titleEl) {
                  data.push({ title: (titleEl as HTMLElement).innerText, link: titleEl.getAttribute("href") || "", snippet: snippetEl ? (snippetEl as HTMLElement).innerText : "", provider: "bing" as const });
                }
              }
              return data;
            });
            if (extracted.length > 0) return extracted.slice(0, 10);
            throw new Error("No results found");
          } finally {
            await page.close();
          }
        },
      };

      try {
        if (providers && providers.length > 0) {
          for (const providerKey of providers) {
            try {
              logs.push(`[Manual] Attempting ${providerKey}...`);
              const pResults = await searchFunctions[providerKey](query);
              results.push(...pResults);
              logs.push(`[Manual] Success: ${providerKey} found ${pResults.length} results.`);
            } catch (e) {
              const errMsg = e instanceof Error ? e.message : String(e);
              errors.push(`${providerKey}: ${errMsg}`);
              logs.push(`[Manual] Failed: ${providerKey} - ${errMsg}`);
            }
          }
        } else {
          const chain: SearchProvider[] = ["duckduckgo-fetch", "duckduckgo-api", "duckduckgo-html", "google", "bing"];
          const browserProviders: SearchProvider[] = ["duckduckgo-html", "google", "bing"];
          let chromeUnavailable = false;

          for (let i = 0; i < chain.length; i++) {
            const providerKey = chain[i];
            if (chromeUnavailable && browserProviders.includes(providerKey)) {
              logs.push(`[Fallback Chain] Skipping ${providerKey}: Chrome not available on this system.`);
              continue;
            }
            const nextProvider = chain[i + 1];
            try {
              logs.push(`[Fallback Chain] Attempting ${providerKey}...`);
              const pResults = await searchFunctions[providerKey](query);
              results.push(...pResults);
              logs.push(`[Fallback Chain] Success: ${providerKey} found ${pResults.length} results. Stopping chain.`);
              break;
            } catch (e) {
              const errMsg = e instanceof Error ? e.message : String(e);
              errors.push(`${providerKey}: ${errMsg}`);
              if (/chrome|chromium/i.test(errMsg) && browserProviders.includes(providerKey)) {
                chromeUnavailable = true;
                logs.push(`[Fallback Chain] Failed: ${providerKey} - Chrome not available. Skipping all browser-based providers.`);
              } else {
                const nextMsg = nextProvider ? `Falling back to ${nextProvider}...` : "No more providers.";
                logs.push(`[Fallback Chain] Failed: ${providerKey} - ${errMsg}. ${nextMsg}`);
              }
            }
          }
        }
      } finally {
        if (sharedBrowser) await sharedBrowser.close().catch(() => {});
      }

      if (results.length === 0) return { error: "All attempted search providers failed.", attempts: errors, trace: logs };

      const seenLinks = new Set<string>();
      const dedupedResults = results.filter(r => {
        const key = r.link.trim();
        if (!key || seenLinks.has(key)) return false;
        seenLinks.add(key);
        return true;
      });

      return {
        results: dedupedResults,
        meta: { total_found: dedupedResults.length, providers_used: [...new Set(dedupedResults.map(r => r.provider))], no_api_key_required: true, trace: logs },
      };
    },
  }));

  tools.push(tool({
    name: "fetch_web_content",
    description: "Fetch the clean, text-based content of a webpage URL.",
    parameters: {
      url: z.string(),
    },
    implementation: async ({ url }) => {
      try {
        const response = await safeFetch(url, { timeoutMs: 30_000 });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        let rawText = await response.text();

        const result: any = { url, status: response.status };
        const titleMatch = rawText.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch) result.title = titleMatch[1];

        const { compile } = await import("html-to-text");
        const convert = compile({ wordwrap: false, selectors: [{ selector: "a", options: { ignoreHref: true } }, { selector: "img", format: "skip" }] });
        rawText = convert(rawText);
        result.content = rawText.substring(0, 40000) + (rawText.length > 40000 ? "... (truncated)" : "");
        return result;
      } catch (error) {
        return { error: `Failed to fetch URL: ${error instanceof Error ? error.message : String(error)}` };
      }
    },
  }));

  tools.push(tool({
    name: "rag_web_content",
    description: "Fetch content from a URL, and then use RAG to find and return only the text chunks most relevant to a specific query.",
    parameters: {
      url: z.string(),
      query: z.string(),
    },
    implementation: async ({ url, query }) => {
      try {
        const response = await safeFetch(url, { timeoutMs: 30_000 });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        let rawText = await response.text();

        const { compile } = await import("html-to-text");
        const convert = compile({ wordwrap: false, selectors: [{ selector: "a", options: { ignoreHref: true } }, { selector: "img", format: "skip" }] });
        rawText = convert(rawText);

        if (rawText.length === 0) return { error: "Could not extract any text from the URL." };
        if (!ctx.client) return { error: "LM Studio Client is not available." };

        const ragResults = await performRagOnText(rawText, query, ctx.client, ctx.embeddingModelName);
        return { url, query, relevant_chunks: ragResults };
      } catch (error) {
        return { error: `Failed during RAG web search: ${error instanceof Error ? error.message : String(error)}` };
      }
    },
  }));

  tools.push(tool({
    name: "wikipedia_search",
    description: "Search Wikipedia for a given query and return page summaries.",
    parameters: {
      query: z.string(),
      lang: z.string().optional().describe("Language code (default: en)"),
    },
    implementation: createSafeToolImplementation(
      async ({ query, lang = "en" }) => {
        try {
          const searchUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json`;
          const searchData = await (await safeFetch(searchUrl, { timeoutMs: 15_000 })).json();

          if (!searchData.query?.search?.length) return { results: "No Wikipedia articles found." };

          const results = [];
          for (const item of searchData.query.search.slice(0, 3)) {
            const pageUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&pageids=${item.pageid}&format=json`;
            const pageData = await (await safeFetch(pageUrl, { timeoutMs: 15_000 })).json();
            const page = pageData.query.pages[item.pageid];
            results.push({
              title: item.title,
              summary: page.extract.substring(0, 2000) + (page.extract.length > 2000 ? "..." : ""),
              url: `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, "_"))}`,
            });
          }
          return { results };
        } catch (error) {
          return { error: `Wikipedia search failed: ${error instanceof Error ? error.message : String(error)}` };
        }
      },
      ctx.enableWikipedia,
      "wikipedia_search"
    ),
  }));

  return tools;
}
