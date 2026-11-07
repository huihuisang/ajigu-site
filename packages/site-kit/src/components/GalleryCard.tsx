import { formatShortText, type StudioCopy } from "../copy";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@ajigu/ui/components/card";
import { AppIcon } from "./AppIcon";
import { ArrowUpRight } from "@ajigu/ui/icons";
interface Props {
  id: string;
  name: string;
  href: string;
  platform: string;
  description: string;
  file: string;
  facts: {
    releaseDate: string | null;
    releaseDateEstimated?: boolean;
    releasePending?: boolean;
    pricing: string | null;
  };
  copy: StudioCopy["gallery"];
}
export function GalleryCard({ id, name, href, platform, description, file, facts, copy }: Props) {
  return (
    <a className={`work-tile work-tile--${id}`} data-product-id={id} href={href} aria-label={name}>
      <Card className="gallery-card">
        <CardContent className="gallery-stage">
          <img
            className="gallery-mockup"
            src={`/gallery/${file}`}
            alt=""
            width="1600"
            height="1200"
            decoding="async"
          />
        </CardContent>
        <CardHeader className="gallery-caption">
          <div className="gallery-summary">
            <AppIcon id={id} size={64} />
            <div className="gallery-identity">
              <CardTitle>{name}</CardTitle>
              <div className="gallery-meta">
                <span className="gallery-platform">{platform}</span>
                {facts.pricing && (
                  <span className="gallery-pricing">
                    {copy.pricing[facts.pricing as keyof typeof copy.pricing]}
                  </span>
                )}
              </div>
            </div>
          </div>
          <CardDescription>{formatShortText(description)}</CardDescription>
        </CardHeader>
        <CardFooter className="gallery-details">
          <div className="gallery-release">
            {!facts.releasePending && <span>{copy.firstRelease}</span>}
            {facts.releaseDate ? (
              <time
                dateTime={facts.releaseDate}
                title={facts.releaseDateEstimated ? copy.releaseEstimate : undefined}
              >
                {facts.releaseDateEstimated ? "≈ " : ""}
                {facts.releaseDate}
              </time>
            ) : (
              <span>{facts.releasePending ? copy.releasePending : copy.releaseUnknown}</span>
            )}
          </div>
          <ArrowUpRight className="gallery-arrow" aria-hidden="true" />
        </CardFooter>
      </Card>
    </a>
  );
}
