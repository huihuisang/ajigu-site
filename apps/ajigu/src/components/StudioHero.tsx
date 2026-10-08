import { useEffect, useState } from "react";
import { Media } from "@ajigu/site-kit/components/Media";
import { typeArtwork } from "@ajigu/site-kit/copy";

export default function StudioHero({ locale }: { locale: string }) {
  const [moodsk, setMoodsk] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return (
    <div className="studio-hero-canvas" aria-label="TypeNote & ajigu">
      <span className="studio-disc" aria-hidden="true" />
      <span className="studio-quarter" aria-hidden="true" />
      <span className="studio-dots" aria-hidden="true" />
      <div className={`studio-hero-window${moodsk ? " is-moodsk" : ""}`}>
        <Media
          file={moodsk ? "moodsk.webp" : typeArtwork(locale)}
          alt={moodsk ? "Moodsk" : "TypeNote"}
          eager
        />
      </div>
      <div className="studio-plinth" aria-hidden="true" />
      <Media file="ajigu.webp" className="studio-hero-bird" eager />
      <button
        className="studio-hero-stamp"
        type="button"
        data-hero-toggle
        disabled={!ready}
        aria-pressed={moodsk}
        onClick={() => setMoodsk((value) => !value)}
      >
        {moodsk ? "Moodsk ↔ TypeNote" : "TypeNote ↔ Moodsk"}
      </button>
    </div>
  );
}
