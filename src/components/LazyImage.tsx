import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  blur?: boolean;
  aspectRatio?: "square" | "video" | "wide" | "portrait" | "auto";
}

export const LazyImage = ({
  src,
  alt,
  placeholder,
  blur = true,
  aspectRatio = "auto",
  className,
  ...props
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "100px",
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const aspectRatioClass = {
    square: "aspect-square",
    video: "aspect-video",
    wide: "aspect-[21/9]",
    portrait: "aspect-[3/4]",
    auto: "",
  }[aspectRatio];

  const defaultPlaceholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23f3f4f6' width='400' height='300'/%3E%3C/svg%3E";

  return (
    <div
      ref={imgRef}
      className={cn(
        "relative overflow-hidden bg-muted",
        aspectRatioClass,
        className
      )}
    >
      {/* Placeholder/Blur background */}
      {blur && !isLoaded && (
        <div
          className="absolute inset-0 bg-muted animate-pulse"
          style={{
            backgroundImage: placeholder ? `url(${placeholder})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(10px)",
            transform: "scale(1.1)",
          }}
        />
      )}

      {/* Actual Image */}
      {isInView && !hasError && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-500",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          {...props}
        />
      )}

      {/* Fallback for errors */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <span className="text-muted-foreground text-sm">Image unavailable</span>
        </div>
      )}

      {/* Not in view placeholder */}
      {!isInView && (
        <img
          src={defaultPlaceholder}
          alt=""
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
};

// Skeleton loader for cards
export const ImageSkeleton = ({ 
  aspectRatio = "video",
  className 
}: { 
  aspectRatio?: "square" | "video" | "wide" | "portrait";
  className?: string;
}) => {
  const aspectRatioClass = {
    square: "aspect-square",
    video: "aspect-video",
    wide: "aspect-[21/9]",
    portrait: "aspect-[3/4]",
  }[aspectRatio];

  return (
    <div className={cn("bg-muted animate-pulse rounded-lg", aspectRatioClass, className)} />
  );
};
