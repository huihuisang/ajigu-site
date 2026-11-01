import { formatShortText } from "../copy";
import type { ReactNode } from "react";
import { AppIcon } from "./AppIcon";
import { DisplayTitle } from "./DisplayTitle";
interface Props {
  id: string;
  name: string;
  claim?: string;
  intro: string;
  art?: ReactNode;
  customArt?: boolean;
  actions?: ReactNode;
  children?: ReactNode;
  note?: string;
}
export function ProductHero({
  id,
  name,
  claim,
  intro,
  art,
  customArt = false,
  actions,
  note,
}: Props) {
  return (
    <section className="product-hero studio-shell" id="hero">
      <div className="product-heading" data-enter>
        <AppIcon id={id} size={72} />
        <h1>{name}</h1>
        {claim && (
          <p className="product-claim">
            <DisplayTitle text={formatShortText(claim)} />
          </p>
        )}
        <p className="product-intro">{intro}</p>
        <div className="product-actions">{actions}</div>
        {note && <p className="product-note">{note}</p>}
      </div>
      <div className="product-art">
        {customArt ? (
          art
        ) : (
          <img
            src={`/studio/products/${id}-mockup.webp`}
            alt={name}
            width="1600"
            height="1200"
            fetchPriority="high"
            decoding="async"
          />
        )}
      </div>
    </section>
  );
}
