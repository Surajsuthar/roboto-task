"use client";

import Link from "next/link";
import { Calendar, User } from "lucide-react";
import { BlogPostForIndexing } from "@/lib/algolia/indexing";
import { Badge } from "@workspace/ui/components/badge";

interface SearchResultsProps {
  results: BlogPostForIndexing[];
  isSearching: boolean;
  query: string;
  className?: string;
}

export function SearchResults({
  results,
  isSearching,
  query,
  className,
}: SearchResultsProps) {
  if (isSearching) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
          <span className="text-muted-foreground">Searching...</span>
        </div>
      </div>
    );
  }

  if (!query.trim()) {
    return null;
  }

  if (results.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No blog posts found for "{query}"
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Try different keywords or check your spelling
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Found {results.length} result{results.length !== 1 ? "s" : ""} for "
          {query}"
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {results.map((post) => (
          <SearchResultCard key={post.objectID} post={post} />
        ))}
      </div>
    </div>
  );
}

interface SearchResultCardProps {
  post: BlogPostForIndexing;
}

function SearchResultCard({ post }: SearchResultCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <article className="group relative bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow">
      <Link href={post.slug} className="block">
        <div className="aspect-video overflow-hidden rounded-t-lg">
          {post.imageUrl ? (
            <img
              src={post.imageUrl}
              alt={post.imageAlt || post.title}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-sm">No image</span>
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            {post.tags && post.tags.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {post.tags[0]}
              </Badge>
            )}
          </div>

          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>

          <p className="text-muted-foreground text-sm mb-3 line-clamp-3">
            {post.excerpt}
          </p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {post.publishedAt && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(post.publishedAt)}</span>
              </div>
            )}

            {post.authorName && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{post.authorName}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
