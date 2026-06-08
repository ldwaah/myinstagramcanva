import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "ghost" | "gradient-outline";

interface MicButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  shimmer?: boolean;
  href?: string;
  external?: boolean;
  children: ReactNode;
}

const variantClass: Record<Variant, string> = {
  primary: "mic-btn mic-btn-primary",
  ghost: "mic-btn mic-btn-ghost",
  "gradient-outline": "mic-btn mic-btn-gradient-outline",
};

export function MicButton({
  variant = "primary",
  shimmer = false,
  href,
  external,
  className = "",
  children,
  ...props
}: MicButtonProps) {
  const classes = `${variantClass[variant]}${shimmer ? " landing-cta-shimmer" : ""} ${className}`.trim();

  if (href) {
    if (external || href.startsWith("http")) {
      return (
        <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
