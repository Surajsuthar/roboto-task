import { adminClient, algoliaConfig } from "./config";
import { sanityFetch } from "../sanity/live";
import { queryAllBlogPosts, queryBlogIndexPageData } from "../sanity/query";

export interface BlogPostForIndexing {
  objectID: string;
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  authorName?: string;
  authorPosition?: string;
  imageUrl?: string;
  excerpt: string;
  tags?: string[];
  _type: string;
  _id: string;
}

export async function fetchAllBlogPostsForIndexing(): Promise<
  BlogPostForIndexing[]
> {
  
  const { data: blog } = await sanityFetch({
    query: queryBlogIndexPageData,
    stega: false,
  });

  const {
    blogs = [],
    title,
    description,
    pageBuilder = [],
    _id,
    _type,
    displayFeaturedBlogs,
    featuredBlogsCount,
  } = blog;

  
  if (!blogs || !Array.isArray(blogs)) {
    return [];
  }
  
  return blogs.map((blog) => ({
    objectID: blog._id,
    title: blog.title || "",
    description: blog.description || "",
    slug: blog.slug || "",
    publishedAt: blog.publishedAt || blog._createdAt || "",
    authorName: blog.authors?.name || "",
    authorPosition: blog.authors?.position || "",
    imageUrl: blog.image.blurData || "",
    excerpt: blog.description || "",
    tags: blog.tags || [],
    _type: blog._type,
    _id: blog._id,
  }));
}

export async function indexBlogPostsToAlgolia(): Promise<void> {
  
  if (!adminClient) {
    console.error("Algolia admin client not configured");
    return;
  }

  try {
    const blogPosts = await fetchAllBlogPostsForIndexing();

    await adminClient.clearObjects({
      indexName: process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME!,
    });

    if (blogPosts.length > 0) {
      await adminClient.saveObjects({
        indexName: process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME!,
        objects: blogPosts as unknown as Record<string, unknown>[],
      });
      console.log(
        `Successfully indexed ${blogPosts.length} blog posts to Algolia`,
      );
    }
  } catch (error) {
    console.error("Error indexing blog posts to Algolia:", error);
    throw error;
  }
}
