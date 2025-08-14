"use client";

import { useState } from "react";
import { BlogSearch } from "./blog-search";
import { SearchResults } from "./search-results";
import { BlogPostForIndexing } from "@/lib/algolia/indexing";

export function BlogSearchWrapper() {
  const [searchResults, setSearchResults] = useState<BlogPostForIndexing[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const hasSearchResults =
    searchResults.length > 0 && searchQuery.trim().length > 0;

  const hideRegularBlogs = hasSearchResults;

  return (
    <>
      <div className="mb-12">
        <BlogSearch
          onSearchResults={setSearchResults}
          onSearching={setIsSearching}
          onQueryChange={setSearchQuery}
          className="max-w-md mx-auto"
        />
      </div>

      {hasSearchResults && (
        <SearchResults
          results={searchResults}
          isSearching={isSearching}
          query={searchQuery}
          className="mb-12"
        />
      )}

      {hideRegularBlogs && (
        <style jsx global>{`
          .blog-content {
            display: none !important;
          }
        `}</style>
      )}
    </>
  );
}
