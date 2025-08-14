import { notFound } from "next/navigation";
import { stegaClean } from "next-sanity";

import { ArticleJsonLd } from "@/components/json-ld";
import { RichText } from "@/components/richtext";
import { SanityImage } from "@/components/sanity-image";
import { TableOfContent } from "@/components/table-of-content";
import { BlogCard } from "@/components/blog-card";
import { BlogSearchWrapper } from "@/components/blog-search-wrapper";
import { client } from "@/lib/sanity/client";
import { sanityFetch } from "@/lib/sanity/live";
import { 
  queryBlogPaths, 
  queryBlogSlugPageData, 
  queryCategoryPaths, 
  queryCategoryPageData 
} from "@/lib/sanity/query";
import { getSEOMetadata } from "@/lib/seo";

async function fetchBlogSlugPageData(slug: string, stega = true) {
  return await sanityFetch({
    query: queryBlogSlugPageData,
    params: { slug: `/blog/${slug}` },
    stega,
  });
}

async function fetchAllBlogAndCategoryPaths() {
  const [blogSlugs, categorySlugs] = await Promise.all([
    client.fetch(queryBlogPaths),
    client.fetch(queryCategoryPaths),
  ]);
  const paths: { slug: string }[] = [];
  for (const slug of [...blogSlugs, ...categorySlugs]) {
    if (!slug) continue;
    const [, , path] = slug.split("/");
    if (path) paths.push({ slug: path });
  }
  return paths;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
 
  const { data } = await fetchBlogSlugPageData(slug, false);
  
  if (data) {
    return getSEOMetadata({
      title: data?.title ?? data?.seoTitle ?? "",
      description: data?.description ?? data?.seoDescription ?? "",
      slug: data?.slug,
      contentId: data?._id,
      contentType: data?._type,
      pageType: "article",
    });
  }
  
  const { data: cat } = await sanityFetch({
    query: queryCategoryPageData,
    params: { slug: `/blog/${slug}`, offset: 0, end: 1 },
    stega: false,
  });

  const category = cat?.category;
  return getSEOMetadata(
    category
      ? {
          title: category?.title ?? category?.seoTitle ?? "",
          description: category?.description ?? category?.seoDescription ?? "",
          slug: category?.slug,
          contentId: category?._id,
          contentType: category?._type,
        }
      : {},
  );
}

export async function generateStaticParams() {
  return await fetchAllBlogAndCategoryPaths();
}

export default async function BlogOrCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ slug }, { page }] = await Promise.all([params, searchParams]);
  // Try blog first
  const { data } = await fetchBlogSlugPageData(slug);
  if (data) {
    const { title, description, image, richText } = data ?? {};
    return (
      <div className="container my-16 mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
          <main>
            <ArticleJsonLd article={stegaClean(data)} />
            <header className="mb-8">
              <h1 className="mt-2 text-4xl font-bold">{title}</h1>
              <p className="mt-4 text-lg text-muted-foreground">{description}</p>
            </header>
            {image && (
              <div className="mb-12">
                <SanityImage
                  asset={image}
                  alt={title}
                  width={1600}
                  loading="eager"
                  priority
                  height={900}
                  className="rounded-lg h-auto w-full"
                />
              </div>
            )}
            <RichText richText={richText ?? []} />
          </main>

          <div className="hidden lg:block">
            <div className="sticky top-4 rounded-lg ">
              <TableOfContent richText={richText} />
            </div>
          </div>
        </div>
      </div>
    );
  }


  const currentPage = Math.max(1, Number.parseInt(page ?? "1"));
  const PAGE_SIZE = 12;
  const offset = (currentPage - 1) * PAGE_SIZE;
  const end = offset + PAGE_SIZE;
  const { data: cat } = await sanityFetch({
    query: queryCategoryPageData,
    params: { slug: `/blog/${slug}`, offset, end },
  });

  if (!cat?.category) return notFound();

  const { category, posts = [], total = 0 } = cat;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <main className="bg-background">
      <div className="container my-16 mx-auto px-4 md:px-6">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">{category.title}</h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">
          {category.description}
        </p>
      </div>
    </div>
        <BlogSearchWrapper/>

        {posts.length > 0 ? (
          <div className="blog-content grid grid-cols-1 gap-8 md:gap-12 lg:grid-cols-2 mt-8">
            {posts.map((blog: any) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No posts in this category yet.</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              const isActive = p === currentPage;
              return (
                <a
                  key={p}
                  href={`?page=${p}`}
                  className={`px-3 py-1 rounded-md text-sm ${isActive ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                >
                  {p}
                </a>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
