import { catalogSummaries } from "../data/catalog/summaryData";
import { AITool } from "../types/tool";
let catalogRevision = 0;
export const getCatalogRevision = () => catalogRevision;

export async function api<T>(
  action: string,
  body?: unknown,
  token?: string,
  slug?: string,
): Promise<T> {
  const response = await fetch(
    `/api/platform?action=${action}${slug ? `&slug=${encodeURIComponent(slug)}` : ""}`,
    {
      method: body === undefined ? "GET" : "POST",
      signal: AbortSignal.timeout(action === 'analyze' || action === 'execute' ? 65000 : 20000),
      headers: {
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    },
  );
  if (!response.headers.get("content-type")?.includes("application/json"))
    throw new Error(
      "The platform API is unavailable. Use the configured Vercel environment.",
    );
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Request failed.");
  return result;
}
let catalogRequest: Promise<void> | undefined;
export function refreshCatalog(): Promise<void> {
  if (!catalogRequest) catalogRequest = loadCatalog().finally(() => { catalogRequest = undefined; });
  return catalogRequest;
}
async function loadCatalog() {
  const overrides = await api<AITool[]>("catalog");
  for (const tool of overrides) {
    const index = catalogSummaries.findIndex((t) => t.slug === tool.slug);
    if (index < 0) catalogSummaries.push(tool);
    else catalogSummaries[index] = tool;
  }
  catalogRevision++;
}
