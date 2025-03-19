const cache = new Map<string, unknown>();
const promises = new Map<string, Promise<unknown>>();

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch');
  }
  return response.json();
}

function getPromise(url: string) {
  const existing = promises.get(url);
  if (existing) {
    return existing;
  }
  const promise = fetchJson(url);
  promises.set(url, promise);
  return promise;
}

export async function cachedFetch<T>(url: string): Promise<T> {
  if (cache.has(url)) {
    return cache.get(url) as T;
  }

  const data = await getPromise(url);
  cache.set(url, data);
  return data as T;
}
