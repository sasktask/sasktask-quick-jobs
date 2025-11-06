import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const RSSFeed = () => {
  const { data: posts } = useQuery({
    queryKey: ["rss-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("status", "published")
        .lte("published_at", new Date().toISOString())
        .order("published_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
  });

  useEffect(() => {
    if (posts) {
      const siteUrl = window.location.origin;
      const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>SaskTask Blog</title>
    <link>${siteUrl}/blog</link>
    <description>Tips, insights, and stories from the SaskTask community</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${posts
      .map(
        (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${siteUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${siteUrl}/blog/${post.slug}</guid>
      <description><![CDATA[${post.excerpt || ""}]]></description>
      <pubDate>${new Date(post.published_at).toUTCString()}</pubDate>
      ${post.cover_image_url ? `<enclosure url="${post.cover_image_url}" type="image/jpeg"/>` : ""}
    </item>`
      )
      .join("")}
  </channel>
</rss>`;

      // Set content type and body
      const blob = new Blob([rssXml], { type: "application/rss+xml" });
      const url = URL.createObjectURL(blob);
      
      // Trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = "rss.xml";
      link.click();
      URL.revokeObjectURL(url);

      // Replace page content with XML
      document.open();
      document.write(rssXml);
      document.close();
    }
  }, [posts]);

  return (
    <div style={{ fontFamily: "monospace", padding: "20px" }}>
      Generating RSS feed...
    </div>
  );
};

export default RSSFeed;
