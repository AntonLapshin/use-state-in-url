export type SearchParams = Map<string, string>;

export function parseSearch(search: string): SearchParams {
  const params = new Map<string, string>();
  const query = search.startsWith("?") ? search.slice(1) : search;
  
  if (!query) return params;
  
  query.split("&").forEach(pair => {
    const [key, value] = pair.split("=");
    if (key) params.set(key, value || "");
  });
  
  return params;
}

export function buildSearch(params: SearchParams): string {
  if (params.size === 0) return "";
  
  const pairs = Array.from(params.entries())
    .map(([key, value]) => `${key}=${value}`);
  
  return "?" + pairs.join("&");
}

export function isEqual(a: unknown, b: unknown): boolean {
  // Handle NaN case
  if (Number.isNaN(a) && Number.isNaN(b)) return true;
  
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== "object" || !a || !b) return false;
  
  // Differentiate between arrays and objects
  const aIsArray = Array.isArray(a);
  const bIsArray = Array.isArray(b);
  if (aIsArray !== bIsArray) return false;
  
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && 
         keys.every(key => isEqual((a as any)[key], (b as any)[key]));
} 