#!/usr/bin/env node

import 'dotenv/config';
import { createClient } from '@sanity/client';
import { adminClient, algoliaConfig } from '../src/lib/algolia/config';

// Create Sanity client directly for the script
const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-28',
  token: process.env.SANITY_API_READ_TOKEN,
  useCdn: false,
});

// GROQ query for all blog posts
const queryAllBlogPosts = `
  *[_type == "blog" && (seoHideFromLists != true)] | order(publishedAt desc){
    _id,
    _type,
    _createdAt,
    title,
    description,
    "slug": slug.current,
    publishedAt,
    tags,
    "imageUrl": image.asset->url,
    "imageAlt": image.alt,
    "authorName": authors[0]->name,
    "authorPosition": authors[0]->position
  }
`;

interface BlogPostForIndexing {
  objectID: string;
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  authorName?: string;
  authorPosition?: string;
  imageUrl?: string;
  imageAlt?: string;
  excerpt: string;
  tags?: string[];
  _type: string;
  _id: string;
}

async function fetchAllBlogPostsForIndexing(): Promise<BlogPostForIndexing[]> {
  const blogs = await sanityClient.fetch(queryAllBlogPosts);

  if (!blogs || !Array.isArray(blogs)) {
    return [];
  }

  return blogs.map((blog) => ({
    objectID: blog._id,
    title: blog.title || '',
    description: blog.description || '',
    slug: blog.slug || '',
    publishedAt: blog.publishedAt || blog._createdAt || '',
    authorName: blog.authorName || '',
    authorPosition: blog.authorPosition || '',
    imageUrl: blog.imageUrl || '',
    imageAlt: blog.imageAlt || '',
    excerpt: blog.description || '',
    tags: blog.tags || [],
    _type: blog._type,
    _id: blog._id,
  }));
}

async function indexBlogPostsToAlgolia(): Promise<void> {
  if (!adminClient) {
    console.error('Algolia admin client not configured');
    return;
  }

  try {
    const blogPosts = await fetchAllBlogPostsForIndexing();
    
    await adminClient.clearObjects({
      indexName: "blog_post"
    });

    // Add new objects
    if (blogPosts.length > 0) {
      await adminClient.saveObjects({
        indexName: "blog_post",
        objects: blogPosts as unknown as Record<string, unknown>[],
      });
      console.log(`Successfully indexed ${blogPosts.length} blog posts to Algolia`);
    }
    
  } catch (error) {
    console.error('Error indexing blog posts to Algolia:', error);
    throw error;
  }
}

async function main() {
  console.log('Starting Algolia indexing...');
  
  try {
    await indexBlogPostsToAlgolia();
    console.log('✅ Blog posts indexed successfully!');
  } catch (error) {
    console.error('❌ Error indexing blog posts:', error);
    process.exit(1);
  }
}

main();

