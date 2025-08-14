import Link from "next/link";
import { SanityImage } from "./sanity-image";
import { Calendar, User } from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import { BlogWithPokemon } from "@/types";

interface BlogCardProps {
  blog: BlogWithPokemon;
}

export function BlogCard({ blog }: BlogCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <article className="group relative bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow">
      <Link href={blog.slug ?? "#"} className="block">
        <div className="aspect-video overflow-hidden rounded-t-lg">
          {blog.image?.asset ? (
            <SanityImage
              asset={blog.image}
              width={800}
              height={450}
              alt={blog.title ?? "Blog image"}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-sm">No image</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {blog.title}
          </h3>

          {/* Description */}
          {blog.description && (
            <p className="text-muted-foreground text-sm mb-3 line-clamp-3">
              {blog.description}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {blog.publishedAt && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(blog.publishedAt)}</span>
              </div>
            )}

            {blog.authors?.name && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{blog.authors.name}</span>
              </div>
            )}

            {blog?.pokemon?.name ? (
              <div className="flex items-center gap-2 pt-1">
                {blog.pokemon.sprite ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={blog.pokemon.sprite}
                    alt={blog.pokemon.name ?? "pokemon"}
                    width={22}
                    height={22}
                    className="rounded"
                  />
                ) : null}
                <span className="text-xs text-muted-foreground">
                  {blog.pokemon.name}{" "}
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  );
}
