import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-colored hover:shadow-glow hover:-translate-y-0.5",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md hover:shadow-lg",
        outline: "border-2 border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:border-primary/50 hover:-translate-y-0.5",
        secondary: "bg-secondary text-secondary-foreground shadow-md hover:shadow-lg hover:-translate-y-0.5",
        ghost: "hover:bg-white/10 hover:backdrop-blur-sm hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        hero: "bg-gradient-hero text-white font-bold shadow-colored hover:shadow-glow-lg hover:-translate-y-1 hover:scale-[1.02]",
        accent: "bg-accent text-accent-foreground shadow-md hover:shadow-lg hover:-translate-y-0.5",
        premium: "bg-gradient-primary text-primary-foreground shadow-colored hover:shadow-glow hover:-translate-y-1 hover:scale-[1.02] relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700",
        "premium-outline": "border-2 border-primary/30 bg-primary/5 backdrop-blur-sm text-primary hover:bg-primary/15 hover:border-primary/50 hover:-translate-y-0.5",
        "premium-ghost": "text-primary hover:bg-primary/10 backdrop-blur-sm hover:-translate-y-0.5",
        success: "bg-success text-success-foreground shadow-md hover:shadow-lg hover:-translate-y-0.5",
        glass: "bg-white/15 backdrop-blur-xl border border-white/30 text-foreground hover:bg-white/25 hover:-translate-y-0.5 shadow-glass",
        "glass-primary": "bg-primary/15 backdrop-blur-xl border border-primary/30 text-primary hover:bg-primary/25 hover:-translate-y-0.5 shadow-glass",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-14 rounded-2xl px-10 text-base",
        xl: "h-16 rounded-2xl px-12 text-lg",
        icon: "h-11 w-11 rounded-xl",
        "icon-sm": "h-9 w-9 rounded-lg",
        "icon-lg": "h-14 w-14 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
