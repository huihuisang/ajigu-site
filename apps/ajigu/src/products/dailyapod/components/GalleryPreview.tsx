import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@ajigu/ui/components/toggle-group";
import { getCopy } from "@ajigu/site-kit/copy";
const pictures = [
  ...["home", "discover", "search", "favorites", "sky", "solar"].map((view) => ({
    src: `/studio/screens/dailyapod-${view}.webp`,
    width: 1206,
    height: 2622,
  })),
  { src: "/studio/products/dailyapod-mockup.webp", width: 1600, height: 1200 },
];
export default function GalleryPreview({ locale }: { locale: string }) {
  const copy = getCopy(locale);
  const [selected, setSelected] = useState("0");
  const picture = pictures[Number(selected)];
  return (
    <div className="demo-surface gallery-demo" data-gallery-demo>
      <ToggleGroup
        spacing={2}
        className="flex-wrap max-w-full"
        type="single"
        variant="outline"
        value={selected}
        onValueChange={(value) => {
          if (value) setSelected(value);
        }}
        aria-label={copy.preview}
      >
        {copy.views.map((view, i) => (
          <ToggleGroupItem key={view} value={String(i)} data-view={i}>
            {view}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <div className="gallery-preview" aria-live="polite">
        <img
          src={picture.src}
          alt={copy.views[Number(selected)]}
          width={picture.width}
          height={picture.height}
        />
      </div>
    </div>
  );
}
