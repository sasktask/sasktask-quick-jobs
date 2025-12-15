import { useEffect } from "react";

// Preload critical resources
export const preloadCriticalResources = () => {
  // Preload fonts
  const fontLinks = [
    "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
    "https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap",
  ];

  fontLinks.forEach((href) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "style";
    link.href = href;
    document.head.appendChild(link);
  });
};

// Prefetch pages for faster navigation
export const prefetchRoute = (path: string) => {
  const link = document.createElement("link");
  link.rel = "prefetch";
  link.href = path;
  document.head.appendChild(link);
};

// Lazy load images with IntersectionObserver
export const useLazyImages = () => {
  useEffect(() => {
    const images = document.querySelectorAll("img[data-src]");
    
    const imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = img.dataset.src || "";
            img.removeAttribute("data-src");
            imageObserver.unobserve(img);
          }
        });
      },
      { rootMargin: "100px" }
    );

    images.forEach((img) => imageObserver.observe(img));

    return () => imageObserver.disconnect();
  }, []);
};

// Defer non-critical scripts
export const deferScript = (src: string) => {
  const script = document.createElement("script");
  script.src = src;
  script.defer = true;
  document.body.appendChild(script);
};

// Optimize images
export const getOptimizedImageUrl = (
  url: string,
  options: { width?: number; height?: number; quality?: number } = {}
) => {
  const { width = 800, height, quality = 80 } = options;
  
  // If it's a Supabase storage URL, we could add transforms
  // For now, return the original URL
  // In production, you'd integrate with an image CDN
  return url;
};

// Measure Core Web Vitals
export const measureWebVitals = (onReport: (metric: any) => void) => {
  if (typeof window === "undefined") return;

  // Largest Contentful Paint
  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    onReport({ name: "LCP", value: lastEntry.startTime });
  });
  lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });

  // First Input Delay
  const fidObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry: any) => {
      onReport({ name: "FID", value: entry.processingStart - entry.startTime });
    });
  });
  fidObserver.observe({ type: "first-input", buffered: true });

  // Cumulative Layout Shift
  let clsValue = 0;
  const clsObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry: any) => {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
      }
    });
    onReport({ name: "CLS", value: clsValue });
  });
  clsObserver.observe({ type: "layout-shift", buffered: true });
};

// Critical CSS inliner helper
export const criticalStyles = `
  /* Critical above-the-fold styles */
  body { margin: 0; font-family: 'Inter', system-ui, sans-serif; }
  .loading-spinner { animation: spin 1s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

// Resource hints
export const addResourceHints = () => {
  const hints = [
    { rel: "dns-prefetch", href: "https://fonts.googleapis.com" },
    { rel: "dns-prefetch", href: "https://fonts.gstatic.com" },
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  ];

  hints.forEach(({ rel, href, crossOrigin }) => {
    const link = document.createElement("link");
    link.rel = rel;
    link.href = href;
    if (crossOrigin) link.crossOrigin = crossOrigin;
    document.head.appendChild(link);
  });
};

// Initialize performance optimizations
export const initPerformanceOptimizations = () => {
  if (typeof window === "undefined") return;

  // Add resource hints
  addResourceHints();

  // Preload critical resources
  preloadCriticalResources();

  // Measure web vitals in development
  if (process.env.NODE_ENV === "development") {
    measureWebVitals((metric) => {
      console.log(`[Web Vitals] ${metric.name}:`, metric.value);
    });
  }
};
