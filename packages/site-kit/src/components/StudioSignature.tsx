import { useEffect, useRef, useState } from "react";
import { Button } from "@ajigu/ui/components/button";
export function StudioSignature({ label }: { label: string }) {
  const [active, setActive] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      title={label}
      className="studio-signature"
      data-delight={active ? "active" : "idle"}
      onClick={() => {
        clearTimeout(timer.current);
        setActive(true);
        timer.current = setTimeout(() => setActive(false), 600);
      }}
    >
      <img
        className="signature-mascot"
        src="/studio/media/ajigu.webp"
        alt=""
        width={24}
        height={24}
        loading="lazy"
        decoding="async"
      />
    </Button>
  );
}
