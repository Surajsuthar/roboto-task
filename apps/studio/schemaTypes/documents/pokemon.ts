import { defineField, defineType } from "sanity";

export const pokemon = defineField({
  name: "pokemon",
  title: "Pokemon",
  type: "object",
  fields: [
    defineField({ name: "id", title: "ID", type: "number" }),
    defineField({ name: "name", title: "Name", type: "string" }),
    // Keep this field for backward compatibility or if you're still using it somewhere
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
