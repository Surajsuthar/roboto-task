import { algoliasearch } from "algoliasearch";

export const algoliaConfig = {
  appId: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '',
  searchApiKey: process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY || '',
  adminApiKey: process.env.ALGOLIA_ADMIN_API_KEY || '',
};

export const searchClient = algoliasearch(
  algoliaConfig.appId,
  algoliaConfig.searchApiKey
);



export const adminClient = algoliaConfig.adminApiKey 
  ? algoliasearch(algoliaConfig.appId, algoliaConfig.adminApiKey)
  : null;



export const blogIndex = searchClient.searchSingleIndex({
  indexName: "blog_post",
  searchParams: {
    query: ""
  }
});

