import { defineField, defineType } from "sanity";

export const pokemon = defineType({
  name: "pokemon",
  title: "Pokemon",
  type: "document",
  fields: [
    defineField({ name: "id", title: "ID", type: "number" }),
    defineField({ name: "name", title: "Name", type: "string" }),
    defineField({
      name: "sprite",
      title: "Sprite URL",
      type: "string",
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "types.0.type.name",
    },
    prepare({ title, subtitle }) {
      return {
        title: title || "Unknown Pokemon",
        subtitle: subtitle || "No type",
      };
    },
  },
});
