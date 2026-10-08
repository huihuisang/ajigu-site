import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Button } from "@ajigu/ui/components/button";
import { Input } from "@ajigu/ui/components/input";
import { Field, FieldGroup, FieldLabel } from "@ajigu/ui/components/field";
import type { StudioCopy } from "@ajigu/site-kit/copy";
import { ToneEngine } from "../lib/tone-engine";

export function SoundPreview({ copy }: { copy: StudioCopy }) {
  const [note, setNote] = useState<number | null>(null);
  const [playing, setPlaying] = useState<number | null>(null);
  const [sound, setSound] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [text, setText] = useState("");
  const engine = useRef<ToneEngine | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    const tones = new ToneEngine();
    engine.current = tones;
    setReady(true);
    const mute = () => {
      tones.mute();
      setSound(false);
    };
    const visibility = () => {
      if (document.hidden) mute();
    };
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("pagehide", mute);
    return () => {
      clearTimeout(timer.current);
      tones.dispose();
      engine.current = null;
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("pagehide", mute);
    };
  }, []);
  function play(value: number) {
    setNote(value);
    setPlaying(value);
    engine.current?.play(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setPlaying(null), 180);
  }
  function input(event: ChangeEvent<HTMLInputElement>) {
    const value = event.currentTarget.value;
    const native = event.nativeEvent as InputEvent;
    setText(value);
    if (!value || native.isComposing || native.inputType?.startsWith("delete")) return;
    play(((Array.from(value).length - 1) % 7) + 1);
  }
  async function toggleSound() {
    if (busy) return;
    setBusy(true);
    try {
      setSound((await engine.current?.toggle()) || false);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="demo-surface" data-note-demo>
      <div className="demo-heading">
        <p>{copy.preview}</p>
        <Button
          type="button"
          variant="outline"
          data-sound
          aria-pressed={sound}
          disabled={busy || !ready}
          onClick={toggleSound}
        >
          {sound ? copy.soundOff : copy.soundOn}
        </Button>
      </div>
      <div className="demo-keys">
        {[1, 2, 3, 4, 5, 6, 7].map((value) => (
          <Button
            key={value}
            type="button"
            variant="outline"
            data-note={value}
            disabled={!ready}
            aria-label={`${copy.note} ${value}`}
            className={playing === value ? "is-playing" : undefined}
            onClick={() => play(value)}
          >
            {value}
          </Button>
        ))}
      </div>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="sound-input" className="sr-only">
            {copy.typeHint}
          </FieldLabel>
          <div className="demo-type">
            <Input
              id="sound-input"
              data-note-input
              disabled={!ready}
              aria-label={copy.typeHint}
              placeholder={copy.typeHint}
              autoComplete="off"
              maxLength={240}
              value={text}
              onChange={input}
            />
            <output data-note-output aria-live="polite">
              {copy.note} {note || "—"}
            </output>
          </div>
        </Field>
      </FieldGroup>
    </div>
  );
}
