import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { searchClient } from "@/lib/algolia/config";
import { BlogPostForIndexing } from "@/lib/algolia/indexing";

const STORAGE_KEY = "blogSearchCache";

async function fetchSearchResults(query: string): Promise<BlogPostForIndexing[]> {
  if (!query.trim()) return [];
  const cache = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

  if (cache[query]) return cache[query];

  const { hits } = await searchClient.searchSingleIndex({
    indexName: process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME!,
    searchParams: { query },
  });

  const results = hits as BlogPostForIndexing[];

  cache[query] = results;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));

  return results;
}

export function useBlogSearch(query: string) {
  const debouncedQuery = useDebounce(query, 300);

  return useQuery({
    queryKey: ["blogSearch", debouncedQuery],
    queryFn: () => fetchSearchResults(debouncedQuery),
    enabled: debouncedQuery.trim().length > 0,
  });
}
