import { notFound } from "next/navigation";

import { BlogCard } from "@/components/blog-card";
import { BlogSearchWrapper } from "@/components/blog-search-wrapper";
import { sanityFetch } from "@/lib/sanity/live";
import { queryCategoryPageData, queryCategoryPaths } from "@/lib/sanity/query";
import { getSEOMetadata } from "@/lib/seo";

const PAGE_SIZE = 12;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;

  const { data: result } = await sanityFetch({
    query: queryCategoryPageData,
    params: { slug: resolvedParams.slug, offset: 0, end: PAGE_SIZE },
    stega: false,
  });

  const category = result?.category;
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

export default async function CategoryPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ slug: string }>; 
  searchParams: Promise<{ page?: string }> 
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
    
  const currentPage = Math.max(1, Number.parseInt(resolvedSearchParams.page ?? "1"));
  const offset = (currentPage - 1) * PAGE_SIZE;
  const end = offset + PAGE_SIZE;
    
  const { data: res } = await sanityFetch({
    query: queryCategoryPageData,
    params: { slug: `/blog/category/${resolvedParams.slug}`, offset, end },
  });

  if (!res?.category) notFound();

  const { category, posts = [], total = 0 } = res;
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
        <BlogSearchWrapper />

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:gap-12 lg:grid-cols-2 mt-8">
            {posts.map((blog: any) => (
              <BlogCard key={blog._id} blog={blog} />)
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No posts in this category yet.</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              const isActive = page === currentPage;
              return (
                <a
                  key={page}
                  href={`?page=${page}`}
                  className={`px-3 py-1 rounded-md text-sm ${isActive ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                >
                  {page}
                </a>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}