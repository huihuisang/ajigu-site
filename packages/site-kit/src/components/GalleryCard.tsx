import { formatShortText } from "../copy";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@ajigu/ui/components/card";
import { AppIcon } from "./AppIcon";
interface Props {
  id: string;
  name: string;
  href: string;
  platform: string;
  description: string;
  file: string;
}
export function GalleryCard({ id, name, href, platform, description, file }: Props) {
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
          <AppIcon id={id} size={40} />
          <CardTitle>{name}</CardTitle>
          <CardDescription>{formatShortText(description)}</CardDescription>
        </CardHeader>
        <CardFooter className="gallery-platform">{platform}</CardFooter>
      </Card>
    </a>
  );
}
