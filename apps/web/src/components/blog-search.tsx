"use client";

import { Search, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { blogIndex, searchClient } from "@/lib/algolia/config";
import { BlogPostForIndexing } from "@/lib/algolia/indexing";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";

const STORAGE_KEY = "blogSearchCache";
const QUERY_KEY = "lastSearchQuery";

interface BlogSearchProps {
  onSearchResults: (results: BlogPostForIndexing[]) => void;
  onSearching: (isSearching: boolean) => void;
  onQueryChange: (query: string) => void;
  className?: string;
}

export function BlogSearch({
  onSearchResults,
  onSearching,
  onQueryChange,
  className,
}: BlogSearchProps) {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchCache, setSearchCache] = useState<
    Map<string, BlogPostForIndexing[]>
  >(new Map());

  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const storedCache = localStorage.getItem(STORAGE_KEY);
    if (storedCache) {
      try {
        setSearchCache(new Map(JSON.parse(storedCache)));
      } catch {
        console.warn("Failed to parse search cache");
      }
    }

    const storedQuery = localStorage.getItem(QUERY_KEY);
    if (storedQuery) {
      setQuery(storedQuery);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(QUERY_KEY, query);
  }, [query]);

  const performSearch = useCallback(
    async (searchQuery: string) => {
      const trimmedQuery = searchQuery.trim();
      onQueryChange(trimmedQuery);

      if (!trimmedQuery) {
        //@ts-ignore not found
        onSearchResults((prev: any) => (prev.length ? [] : prev));
        return;
      }

      const cachedResults = searchCache.get(trimmedQuery);
      if (cachedResults) {
        onSearchResults(cachedResults);
        return;
      }

      setIsSearching(true);
      onSearching(true);

      try {
        if (!blogIndex) {
          onSearchResults([]);
          return;
        }

        const { hits } = await searchClient.searchSingleIndex({
          indexName: process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME!,
          searchParams: { query: trimmedQuery },
        });

        const results = hits as BlogPostForIndexing[];

        setSearchCache((prevCache) => {
          const newCache = new Map(prevCache).set(trimmedQuery, results);
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(Array.from(newCache.entries()))
          );
          return newCache;
        });

        onSearchResults(results);
      } catch {
        onSearchResults([]);
      } finally {
        setIsSearching(false);
        onSearching(false);
        inputRef.current?.focus();
      }
    },
    [onSearchResults, onSearching, onQueryChange, searchCache]
  );

  useEffect(() => {
    performSearch(debouncedQuery);
  }, [debouncedQuery, performSearch]);

  const clearSearch = useCallback(() => {
    setQuery("");
    onQueryChange("");
    onSearchResults([]);
    inputRef.current?.focus();
  }, [onQueryChange, onSearchResults]);

  const hasQuery = query.trim().length > 0;

  return (
    <div className={`relative z-50 ${className ?? ""}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search blog posts..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10"
          disabled={isSearching}
        />
        {hasQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 -translate-y-1/2 hover:bg-muted"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>

      {isSearching && (
        <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-background border rounded-lg shadow-lg">
          <div className="flex items-center justify-center text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
            Searching...
          </div>
        </div>
      )}

      {!blogIndex && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
          ⚠️ Search is not configured. Please set up Algolia environment
          variables.
        </div>
      )}
    </div>
  );
}
