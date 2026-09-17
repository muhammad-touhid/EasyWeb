import prisma from "@/lib/prisma";
import { PageRenderer } from "@easyweb/page-builder";

const RESERVED_SLUGS = ["admin", "api", "login"];
const PROTECTED_SLUGS = ["home", "site-header", "site-footer"];

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const fullSlug = slug.join("/");

  const page = await prisma.page.findUnique({ where: { slug: fullSlug } });
  if (!page) return {};

  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription,
    keywords: page.metaKeywords,
  };
}

export default async function CatchAllPage({ params }) {
  const { slug } = await params;
  const fullSlug = slug.join("/");

  if (PROTECTED_SLUGS.includes(fullSlug)) return null; // 404 as standalone page

  const page = await prisma.page.findUnique({ where: { slug: fullSlug, status: "published" } });
  if (!page) return null;

  return <PageRenderer data={page.data} />;
}
