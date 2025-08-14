import { author } from "./author";
import { blog } from "./blog";
import { category } from "./category";
import { blogIndex } from "./blog-index";
import { faq } from "./faq";
import { footer } from "./footer";
import { homePage } from "./home-page";
import { navbar } from "./navbar";
import { page } from "./page";
import { pokemon } from "./pokemon";
import { settings } from "./settings";

export const singletons = [homePage, blogIndex, settings, footer, navbar];

export const documents = [
  blog,
  category,
  page,
  faq,
  author,
  pokemon,
  ...singletons,
];
