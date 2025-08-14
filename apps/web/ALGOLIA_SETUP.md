# Algolia Search Integration Setup

This guide will help you set up Algolia search for the blog posts in your Next.js application.

## Prerequisites

1. An Algolia account (free tier available)
2. A Sanity CMS project with blog posts

## Step 1: Create an Algolia Account

1. Go to [Algolia's website](https://www.algolia.com/) and sign up for a free account
2. Create a new application
3. Note down your Application ID

## Step 2: Create an Index

1. In your Algolia dashboard, go to "Search" → "Index"
2. Create a new index called `blog_posts`
3. This will be used to store your blog post data

## Step 3: Get API Keys

1. Go to "Settings" → "API Keys" in your Algolia dashboard
2. Copy the following keys:
   - **Application ID** (public)
   - **Search-Only API Key** (public)
   - **Admin API Key** (private, keep secure)

## Step 4: Configure Environment Variables

Create a `.env.local` file in the `apps/web` directory with the following variables:

```env
# Algolia Configuration
NEXT_PUBLIC_ALGOLIA_APP_ID=your_algolia_app_id
NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=your_algolia_search_api_key
ALGOLIA_ADMIN_API_KEY=your_algolia_admin_api_key
NEXT_PUBLIC_ALGOLIA_INDEX_NAME=blog_posts
```

## Step 5: Index Your Blog Posts

Run the indexing script to sync your Sanity blog posts with Algolia:

```bash
cd apps/web
pnpm run index-algolia
```

This will:
- Fetch all blog posts from Sanity
- Transform them into the correct format for Algolia
- Upload them to your Algolia index
- Configure search settings

## Step 6: Test the Search

1. Start your development server: `pnpm dev`
2. Navigate to `/blog`
3. Use the search bar to test the functionality

## Features

- **Real-time Search**: Results appear as you type
- **Debounced Input**: Prevents excessive API calls
- **Caching**: Repeat searches are cached for better performance
- **Responsive Design**: Works on all device sizes
- **Rich Results**: Shows images, titles, descriptions, and metadata

## API Endpoints

- `POST /api/algolia/index` - Trigger manual indexing (requires authorization)

## Troubleshooting

### Search Not Working
1. Check that all environment variables are set correctly
2. Verify that your Algolia index has data
3. Check the browser console for errors

### Indexing Fails
1. Ensure your Sanity API tokens are valid
2. Check that your Algolia admin API key is correct
3. Verify your Algolia application ID

### Performance Issues
1. The search uses debouncing to prevent excessive API calls
2. Results are cached to improve repeat search performance
3. Consider upgrading your Algolia plan if you exceed free tier limits

## Free Tier Limits

- 10,000 records
- 10,000 operations per month
- 1,000 search requests per day

For most small to medium blogs, this should be sufficient.

