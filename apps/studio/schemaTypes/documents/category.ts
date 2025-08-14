import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import { TagIcon } from "lucide-react";
import { defineField, defineType } from "sanity";

import { GROUP, GROUPS } from "../../utils/constant";
import { ogFields } from "../../utils/og-fields";
import { seoFields } from "../../utils/seo-fields";
import { createSlug, isUnique } from "../../utils/slug";
import { createSlugValidator } from "../../utils/slug-validation";

export const category = defineType({
  name: "category",
  title: "Category",
  type: "document",
  icon: TagIcon,
  groups: GROUPS,
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "category" }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "Category name visible on the website",
      group: GROUP.MAIN_CONTENT,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      description: "Short description used on category pages",
      group: GROUP.MAIN_CONTENT,
    }),
    defineField({
      name: "slug",
      title: "URL",
      type: "slug",
      description:
        "The URL for this category page. Example: /blog/category/sanity",
      group: GROUP.MAIN_CONTENT,
      options: {
        source: "title",
        slugify: createSlug,
        isUnique,
      },
      validation: (Rule) =>
        Rule.required().custom(
          createSlugValidator({
            documentType: "Category",
            requiredPrefix: "/blog/",
          }),
        ),
    }),
    ...seoFields,
    ...ogFields,
  ],
  preview: {
    select: {
      title: "title",
      slug: "slug.current",
    },
    prepare: ({ title, slug }) => ({
      title: title || "Untitled Category",
      subtitle: slug || "",
    }),
  },
});


