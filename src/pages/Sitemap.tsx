import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Sitemap = () => {
  const { data: posts } = useQuery({
    queryKey: ["sitemap-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("slug, updated_at")
        .eq("status", "published")
        .lte("published_at", new Date().toISOString());

      if (error) throw error;
      return data || [];
    },
  });

  useEffect(() => {
    if (posts) {
      const siteUrl = window.location.origin;
      const staticPages = [
        { url: "/", priority: "1.0", changefreq: "daily" },
        { url: "/browse", priority: "0.9", changefreq: "daily" },
        { url: "/find-taskers", priority: "0.9", changefreq: "daily" },
        { url: "/post-task", priority: "0.8", changefreq: "weekly" },
        { url: "/become-tasker", priority: "0.8", changefreq: "weekly" },
        { url: "/how-it-works", priority: "0.8", changefreq: "weekly" },
        { url: "/categories", priority: "0.8", changefreq: "weekly" },
        { url: "/blog", priority: "0.7", changefreq: "daily" },
        { url: "/faq", priority: "0.6", changefreq: "monthly" },
        { url: "/terms", priority: "0.5", changefreq: "yearly" },
        { url: "/privacy", priority: "0.5", changefreq: "yearly" },
      ];

      const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages
    .map(
      (page) => `
  <url>
    <loc>${siteUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    )
    .join("")}
  ${posts
    .map(
      (post) => `
  <url>
    <loc>${siteUrl}/blog/${post.slug}</loc>
    <lastmod>${new Date(post.updated_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join("")}
</urlset>`;

      // Set content type and body
      const blob = new Blob([sitemapXml], { type: "application/xml" });
      const url = URL.createObjectURL(blob);
      
      // Trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = "sitemap.xml";
      link.click();
      URL.revokeObjectURL(url);

      // Replace page content with XML
      document.open();
      document.write(sitemapXml);
      document.close();
    }
  }, [posts]);

  return (
    <div style={{ fontFamily: "monospace", padding: "20px" }}>
      Generating sitemap...
    </div>
  );
};

export default Sitemap;
