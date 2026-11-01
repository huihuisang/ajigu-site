import { useState, type CSSProperties } from "react";
import { Media } from "@ajigu/site-kit/components/Media";
import { Slider } from "@ajigu/ui/components/slider";
import { getCopy } from "@ajigu/site-kit/copy";

export default function ComparisonPreview({
  locale,
  aspect,
  offset,
}: {
  locale: string;
  aspect: string;
  offset: number;
}) {
  const copy = getCopy(locale);
  const [position, setPosition] = useState(50);
  const style = {
    "--photo-aspect": aspect,
    "--photo-offset": `${offset}%`,
    "--compare": `${position}%`,
  } as CSSProperties;
  return (
    <div className="demo-surface">
      <div className="demo-heading">
        <p>{copy.compare}</p>
      </div>
      <div className="comparison-demo" data-compare-demo style={style}>
        <div className="compare-viewport">
          <Media file="tutu-before.webp" alt={copy.original} />
          <div className="compare-result">
            <Media file="tutu-after.webp" alt={copy.result} />
          </div>
          <span className="compare-line" aria-hidden="true" />
        </div>
        <Slider
          min={0}
          max={100}
          value={[position]}
          aria-label={copy.compare}
          onValueChange={(value) => setPosition(value[0])}
          data-compare
        />
        <div className="compare-labels">
          <span>{copy.result}</span>
          <span>{copy.original}</span>
        </div>
      </div>
    </div>
  );
}
