"use client";

import { Search, X } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { useBlogSearch } from "@/hooks/useBlogSearch";

interface BlogSearchProps {
  onSearchResults: (results: any[]) => void;
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
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: results = [], isFetching } = useBlogSearch(query);

  useEffect(() => {
    onQueryChange(query);
  }, [query, onQueryChange]);

  useEffect(() => {
    onSearching(isFetching);
  }, [isFetching, onSearching]);

  useEffect(() => {
    onSearchResults(results);
  }, [results, onSearchResults]);

  const clearSearch = () => {
    setQuery("");
    inputRef.current?.focus();
  };

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

      {isFetching && (
        <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-background border rounded-lg shadow-lg">
          <div className="flex items-center justify-center text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
            Searching...
          </div>
        </div>
      )}
    </div>
  );
}
