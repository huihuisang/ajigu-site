import { useState, type CSSProperties } from "react";
import { ToggleGroup, ToggleGroupItem } from "@ajigu/ui/components/toggle-group";
import { getCopy } from "@ajigu/site-kit/copy";

const bars = [32, 55, 40, 82, 62, 38, 75, 45, 95, 52, 35, 72, 47, 88, 54, 33, 64, 41];

export default function NightPreview({ locale }: { locale: string }) {
  const copy = getCopy(locale);
  const [selected, setSelected] = useState(0);
  return (
    <div className="demo-surface night-preview" data-night-demo>
      <div>
        <div className="demo-heading">
          <p>{copy.night}</p>
        </div>
        <div className="night-bars" aria-hidden="true">
          {bars.map((height, index) => (
            <i
              key={index}
              style={{ "--bar": `${height}%` } as CSSProperties}
              data-event-group={index % 3}
              className={index % 3 === selected ? "is-selected" : undefined}
            />
          ))}
        </div>
        <ToggleGroup
          spacing={2}
          className="flex-wrap max-w-full"
          type="single"
          value={String(selected)}
          onValueChange={(value) => {
            if (value) setSelected(Number(value));
          }}
          variant="outline"
          aria-label={copy.night}
        >
          {copy.events.map((event, index) => (
            <ToggleGroupItem key={event} value={String(index)} data-event={index}>
              {event}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <div className="night-detail" aria-live="polite">
        <small>{copy.sample}</small>
        <h3 data-event-title>{copy.events[selected]}</h3>
        <p data-event-detail>{copy.eventDetails[selected]}</p>
      </div>
    </div>
  );
}
