import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost" | "destructive";
  asChild?: boolean;
};

export function Button({ className, variant = "default", asChild, children, ...props }: ButtonProps) {
  const classes = cn(
    "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition disabled:pointer-events-none disabled:opacity-50",
    variant === "default" && "bg-primary text-primary-foreground shadow-sm hover:bg-emerald-700",
    variant === "outline" && "border bg-white text-foreground hover:bg-muted",
    variant === "ghost" && "hover:bg-muted",
    variant === "destructive" && "bg-destructive text-white hover:bg-red-700",
    className
  );

  if (asChild && React.isValidElement<{ className?: string }>(children)) {
    return React.cloneElement(children, {
      className: cn(classes, children.props.className)
    });
  }

  return (
    <button
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
}
