import type {
  QueryBlogIndexPageDataResult,
  QueryBlogSlugPageDataResult,
  QueryHomePageDataResult,
  QueryImageTypeResult,
} from "./lib/sanity/sanity.types";

export type PageBuilderBlockTypes = NonNullable<
  NonNullable<QueryHomePageDataResult>["pageBuilder"]
>[number]["_type"];

export type PagebuilderType<T extends PageBuilderBlockTypes> = Extract<
  NonNullable<NonNullable<QueryHomePageDataResult>["pageBuilder"]>[number],
  { _type: T }
>;

export type SanityButtonProps = NonNullable<
  NonNullable<PagebuilderType<"hero">>["buttons"]
>[number];

// export type SanityImageProps = Extract<
//   NonNullable<QueryImageTypeResult>,
//   { alt: string; blurData: string | null; dominantColor: string | null }
// >;
export type SanityImageProps = NonNullable<QueryImageTypeResult>;

export type SanityRichTextProps =
  NonNullable<QueryBlogSlugPageDataResult>["richText"];

export type SanityRichTextBlock = Extract<
  NonNullable<NonNullable<SanityRichTextProps>[number]>,
  { _type: "block" }
>;

export type Maybe<T> = T | null | undefined;

export type Blog = NonNullable<
  NonNullable<QueryBlogIndexPageDataResult>["blogs"]
>[number];

export type Pokemon = {
  id: number | null;
  name: string | null;
  types: string[] | null;
  sprite: string | null;
} | null;

export type BlogWithPokemon = Blog & { pokemon?: Pokemon };