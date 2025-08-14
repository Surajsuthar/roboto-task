import { defineField, defineType } from "sanity";

export const pokemon = defineType({
  name: "pokemon",
  title: "Pokemon",
  type: "document",
  fields: [
    defineField({ name: "id", title: "ID", type: "number" }),
    defineField({ name: "name", title: "Name", type: "string" }),
    defineField({
      name: "types",
      title: "Types",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({ name: "sprite", title: "Sprite URL", type: "url" }),
  ],
  preview: {
    select: { title: "name", subtitle: "types.0", media: "sprite" },
    prepare: ({ title, subtitle, media }) => ({ title, subtitle, media }),
  },
});
