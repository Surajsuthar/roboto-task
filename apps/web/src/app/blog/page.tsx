import { notFound } from "next/navigation";

import { BlogCard } from "@/components/blog-card";
import { CategoriesNav } from "@/components/categories-nav";
import { PageBuilder } from "@/components/pagebuilder";
import { BlogSearchWrapper } from "@/components/blog-search-wrapper";
import { sanityFetch } from "@/lib/sanity/live";
import { queryAllCategories, queryBlogIndexPageData } from "@/lib/sanity/query";
import { getSEOMetadata } from "@/lib/seo";
import { handleErrors } from "@/utils";

export async function generateMetadata() {
  const { data: result } = await sanityFetch({
    query: queryBlogIndexPageData,
    stega: false,
  });
  return getSEOMetadata(
    result
      ? {
          title: result?.title ?? result?.seoTitle ?? "",
          description: result?.description ?? result?.seoDescription ?? "",
          slug: result?.slug,
          contentId: result?._id,
          contentType: result?._type,
        }
      : {},
  );
}

export default async function BlogIndexPage() {
  const [[res, err], [catRes]] = await Promise.all([
    await handleErrors(sanityFetch({ query: queryBlogIndexPageData })),
    await handleErrors(sanityFetch({ query: queryAllCategories }))
  ]);

  if (err || !res?.data) notFound();

  const {
    blogs = [],
    title,
    description,
    pageBuilder = [],
    _id,
    _type,
    displayFeaturedBlogs,
    featuredBlogsCount,
  } = res.data;

  const validFeaturedBlogsCount = featuredBlogsCount
    ? Number.parseInt(featuredBlogsCount)
    : 0;

  if (!blogs.length) {
    return (
      <main className="container flex flex-col space-y-2 my-16 mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
        <BlogSearchWrapper />
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No blog posts available at the moment.
          </p>
        </div>
        {pageBuilder && pageBuilder.length > 0 && (
          <PageBuilder pageBuilder={pageBuilder} id={_id} type={_type} />
        )}
      </main>
    );
  }

  const shouldDisplayFeaturedBlogs =
    displayFeaturedBlogs && validFeaturedBlogsCount > 0;

  const remainingBlogs = shouldDisplayFeaturedBlogs
    ? blogs.slice(validFeaturedBlogsCount)
    : blogs;

  return (
    <main className="bg-background">
      <div className="container my-16 mx-auto flex flex-col space-y-2 px-4 md:px-6">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
        <CategoriesNav categories={(catRes?.data ?? []).map((c: any) => ({ _id: c._id, title: c.title, slug: c.slug }))} />
        
        {/* Search Component */}
        <BlogSearchWrapper />

        {/* Regular Blog Content */}
        <div className="blog-content">
          {remainingBlogs.length > 0 && (
            <div className="grid grid-cols-1 gap-8 md:gap-12 lg:grid-cols-2 mt-8">
              {remainingBlogs.map((blog: any) => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </div>
          )}
        </div>
      </div>

      {pageBuilder && pageBuilder.length > 0 && (
        <PageBuilder pageBuilder={pageBuilder} id={_id} type={_type} />
      )}
    </main>
  );
}
