"use client";

import { Search, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { blogIndex, searchClient } from "@/lib/algolia/config";
import { BlogPostForIndexing } from "@/lib/algolia/indexing";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";

const STORAGE_KEY = "blogSearchCache";

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

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSearchCache(new Map(JSON.parse(stored)));
      } catch {
        console.warn("Failed to parse search cache");
      }
    }
  }, []);

  const saveCache = useCallback((cache: Map<string, BlogPostForIndexing[]>) => {
    setSearchCache(cache);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(Array.from(cache.entries())),
    );
  }, []);

  const performSearch = useCallback(
    async (searchQuery: string) => {
      onQueryChange(searchQuery);

      if (!searchQuery.trim()) {
        onSearchResults([]);
        return;
      }

      const cachedResults = searchCache.get(searchQuery);
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
          indexName: "blog_post",
          searchParams: { query: searchQuery },
        });

        const results = hits as BlogPostForIndexing[];
        const newCache = new Map(searchCache).set(searchQuery, results);
        saveCache(newCache);
        onSearchResults(results);
      } catch {
        onSearchResults([]);
      } finally {
        setIsSearching(false);
        onSearching(false);
      }
    },
    [onSearchResults, onSearching, onQueryChange, searchCache, saveCache],
  );

  useEffect(() => {
    performSearch(debouncedQuery);
  }, [debouncedQuery, performSearch]);

  const clearSearch = useCallback(() => {
    setQuery("");
    onQueryChange("");
    onSearchResults([]);
  }, [onQueryChange, onSearchResults]);

  const hasQuery = query.trim().length > 0;

  return (
    <div className={`relative z-50 ${className ?? ""}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
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
