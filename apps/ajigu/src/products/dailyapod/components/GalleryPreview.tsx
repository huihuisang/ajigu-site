import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@ajigu/ui/components/toggle-group";
import { getCopy } from "@ajigu/site-kit/copy";
const pictures = [
  "/studio/screens/dailyapod-sky.webp",
  "/studio/screens/dailyapod-solar.webp",
  "/studio/products/dailyapod-mockup.webp",
];
export default function GalleryPreview({ locale }: { locale: string }) {
  const copy = getCopy(locale);
  const [selected, setSelected] = useState("0");
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
          src={pictures[Number(selected)]}
          alt={copy.views[Number(selected)]}
          width={Number(selected) === 2 ? 1600 : 1206}
          height={Number(selected) === 2 ? 1200 : 2622}
        />
      </div>
    </div>
  );
}
