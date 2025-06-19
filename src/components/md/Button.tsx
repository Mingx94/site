import {
  Button as ButtonUI,
  type buttonVariants,
} from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";

const Button = ({
  href,
  children,
  style,
  rel,
}: {
  href: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  children: React.ReactNode;
  style?: string;
  rel?: string;
}) => {
  return (
    <ButtonUI className="no-underline" asChild>
      <a
        href={href}
        target="_blank"
        rel={`noopener noreferrer ${
          rel ? (rel === "follow" ? "" : rel) : "nofollow"
        }`}
      >
        {children}
      </a>
    </ButtonUI>
  );
};

export default Button;
