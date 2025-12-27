import { Helmet } from "react-helmet";

interface SEOHeadProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "profile";
  publishedTime?: string;
  author?: string;
  keywords?: string[];
  noindex?: boolean;
}

interface StructuredDataProps {
  type: "LocalBusiness" | "Service" | "Person" | "Article" | "FAQPage" | "BreadcrumbList";
  data: Record<string, any>;
}

export const SEOHead = ({
  title,
  description,
  image = "/pwa-icon-512.png",
  url,
  type = "website",
  publishedTime,
  author,
  keywords = [],
  noindex = false,
}: SEOHeadProps) => {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://sasktask.com';
  const fullUrl = url ? `${siteUrl}${url}` : (typeof window !== 'undefined' ? window.location.href : siteUrl);
  const fullImage = image.startsWith("http") ? image : `${siteUrl}${image}`;
  const fullTitle = `${title} | SaskTask`;

  // Default keywords
  const defaultKeywords = [
    "tasks", "jobs", "local services", "handyman",
    "cleaning", "moving help", "task marketplace", "gig economy", "trusted professionals"
  ];
  const allKeywords = [...new Set([...keywords, ...defaultKeywords])];

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={allKeywords.join(", ")} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content="SaskTask" />
      <meta property="og:locale" content="en_CA" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {author && <meta property="article:author" content={author} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />

      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />

      {/* Additional SEO Tags */}
      <meta name="author" content="SaskTask" />
      <meta name="geo.region" content="CA-SK" />
      <meta name="geo.placename" content="Saskatchewan" />
    </Helmet>
  );
};

// Structured Data Component for JSON-LD
export const StructuredData = ({ type, data }: StructuredDataProps) => {
  const getSchema = () => {
    switch (type) {
      case "LocalBusiness":
        return {
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "SaskTask",
          description: "Connect with local taskers for quick jobs in Saskatchewan",
          url: "https://sasktask.com",
          logo: "https://sasktask.com/pwa-icon-512.png",
          areaServed: {
            "@type": "State",
            name: "Saskatchewan",
            containedInPlace: {
              "@type": "Country",
              name: "Canada"
            }
          },
          ...data
        };
      case "Service":
        return {
          "@context": "https://schema.org",
          "@type": "Service",
          provider: {
            "@type": "Organization",
            name: "SaskTask"
          },
          ...data
        };
      case "Person":
        return {
          "@context": "https://schema.org",
          "@type": "Person",
          ...data
        };
      case "Article":
        return {
          "@context": "https://schema.org",
          "@type": "Article",
          publisher: {
            "@type": "Organization",
            name: "SaskTask",
            logo: {
              "@type": "ImageObject",
              url: "https://sasktask.com/pwa-icon-512.png"
            }
          },
          ...data
        };
      case "FAQPage":
        return {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          ...data
        };
      case "BreadcrumbList":
        return {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          ...data
        };
      default:
        return data;
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(getSchema())}
      </script>
    </Helmet>
  );
};

// Pre-built structured data for common pages
export const HomePageSchema = () => (
  <StructuredData
    type="LocalBusiness"
    data={{
      priceRange: "$$",
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "00:00",
        closes: "23:59"
      },
      sameAs: [
        "https://twitter.com/sasktask",
        "https://facebook.com/sasktask"
      ]
    }}
  />
);

export const TaskPageSchema = ({ task }: { task: any }) => (
  <StructuredData
    type="Service"
    data={{
      name: task.title,
      description: task.description,
      offers: {
        "@type": "Offer",
        price: task.pay_amount,
        priceCurrency: "CAD",
        availability: task.status === "open" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
      },
      areaServed: {
        "@type": "Place",
        name: task.location
      }
    }}
  />
);

export const ProfilePageSchema = ({ profile }: { profile: any }) => (
  <StructuredData
    type="Person"
    data={{
      name: profile.full_name,
      description: profile.bio,
      image: profile.avatar_url,
      jobTitle: "Tasker",
      worksFor: {
        "@type": "Organization",
        name: "SaskTask"
      },
      ...(profile.rating && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: profile.rating,
          reviewCount: profile.total_reviews || 0
        }
      })
    }}
  />
);

export const FAQPageSchema = ({ faqs }: { faqs: { question: string; answer: string }[] }) => (
  <StructuredData
    type="FAQPage"
    data={{
      mainEntity: faqs.map(faq => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer
        }
      }))
    }}
  />
);

export const BreadcrumbSchema = ({ items }: { items: { name: string; url: string }[] }) => (
  <StructuredData
    type="BreadcrumbList"
    data={{
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.url
      }))
    }}
  />
);
