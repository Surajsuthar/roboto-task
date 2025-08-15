import { assist } from "@sanity/assist";
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";
import {
  unsplashAssetSource,
  unsplashImageAsset,
} from "sanity-plugin-asset-source-unsplash";
import { iconPicker } from "sanity-plugin-icon-picker";
import { media, mediaAssetSource } from "sanity-plugin-media";

import { Logo } from "./components/logo";
import { locations } from "./location";
import { presentationUrl } from "./plugins/presentation-url";
import { schemaTypes } from "./schemaTypes";
import { structure } from "./structure";
import { createPageTemplate, getPresentationUrl } from "./utils/helper";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? "";
const dataset = process.env.SANITY_STUDIO_DATASET ?? "production";
const title = process.env.SANITY_STUDIO_TITLE ?? "Turbo Studio";

export default defineConfig({
  name: "default",
  title: title,
  projectId: projectId,
  dataset: dataset,
  icon: Logo,
  
  plugins: [
    presentationTool({
      resolve: {
        locations,
      },
      previewUrl: {
        origin: getPresentationUrl(),
        previewMode: {
          enable: "/api/presentation-draft",
        },
      },
    }),
    assist(),
    structureTool({
      structure,
    }),
    visionTool(),
    iconPicker(),
    media(),
    presentationUrl(),
    unsplashImageAsset(),
  ],

  api: {
    projectId: projectId,
    dataset: dataset,
  },
  form: {
    image: {
      assetSources: (prev) => [
        mediaAssetSource,
        unsplashAssetSource,
        ...prev,
      ],
    },
    file: {
      assetSources: (prev) => [
        mediaAssetSource,
        ...prev,
      ],
    },
  },

  document: {
    newDocumentOptions: (prev, { creationContext }) => {
      const { type } = creationContext;
      if (type === "global") return [];
      return prev;
    },
  },

  schema: {
    types: schemaTypes,
    templates: createPageTemplate(),
  },
});