"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Category = {
  _id: string;
  title: string | null;
  slug: string | null;
};

export function CategoriesNav({ categories }: { categories: Category[] }) {
  const pathname = usePathname();

  if (!categories?.length) return null;

  return (
    <nav className="mt-6 flex flex-wrap gap-2 justify-center">
      <Link
        href="/blog"
        className={`px-3 py-1 rounded-full text-sm ${pathname === "/blog" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
      >
        All
      </Link>
      {categories.map((cat) => {
        const href = cat.slug ?? "#";
        const isActive = pathname === href;
        return (
          <Link
            key={cat._id}
            href={href}
            className={`px-3 py-1 rounded-full text-sm ${isActive ? "bg-primary text-primary-foreground" : "bg-muted"}`}
          >
            {cat.title}
          </Link>
        );
      })}
    </nav>
  );
}
