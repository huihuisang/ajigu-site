import { ArrowUpRight, ArrowDown } from "lucide-react";
import { Button } from "./button";
import type { ComponentProps } from "react";

interface Props {
  variant?: ComponentProps<typeof Button>["variant"];
  href: string;
  label: string;
  external?: boolean;
  arrow?: boolean;
}

// Create the anchor inside React so Radix Slot receives a real element across Astro boundaries.
export function LinkButton({ href, label, external = false, arrow = false, variant }: Props) {
  const down = /↓\s*$/.test(label);
  const up = arrow || /↗\s*$/.test(label);
  const text = label.replace(/\s*[↓↗]\s*$/u, "");
  return (
    <Button asChild variant={variant} className="min-h-11">
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
      >
        {text}
        {up ? (
          <ArrowUpRight data-icon="inline-end" aria-hidden="true" />
        ) : down ? (
          <ArrowDown data-icon="inline-end" aria-hidden="true" />
        ) : null}
      </a>
    </Button>
  );
}
