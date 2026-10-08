import type { CSSProperties } from "react";

interface Props {
  id: string;
  size?: number;
}

export function AppIcon({ id, size = 48 }: Props) {
  return (
    <span className="app-icon" style={{ "--app-icon-size": `${size}px` } as CSSProperties}>
      <img src={`/studio/icons/${id}.webp`} alt="" width="256" height="256" decoding="async" />
    </span>
  );
}
