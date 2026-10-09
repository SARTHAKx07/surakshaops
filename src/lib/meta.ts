// Builds per-page <head> metadata.
export const pageMeta = (title: string, description: string) => ({
  meta: [
    { title: `${title} — SurakshaOps` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} — SurakshaOps` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ],
});
