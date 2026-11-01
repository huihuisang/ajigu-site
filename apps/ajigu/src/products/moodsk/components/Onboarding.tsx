import { useEffect, useRef, useState } from "react";
import { Button } from "@ajigu/ui/components/button";
import { ToggleGroup, ToggleGroupItem } from "@ajigu/ui/components/toggle-group";
import { ArrowLeft, ArrowRight, RotateCcw, Play, Pause } from "@ajigu/ui/icons";
import { mountShowcase } from "../showcase/motion";
import messages from "../showcase/copy.json";
import "../showcase/scene.css";
import "../showcase/onboarding.css";
interface State {
  current: number;
  playing: boolean;
  effect: number;
  color: number;
  active: boolean;
}
export default function Onboarding({ locale }: { locale: string }) {
  const copy =
    (messages as Record<string, (typeof messages)["en-GB"]>)[locale] || messages["en-GB"];
  const text = (key: string) =>
    key === "Previous chapter"
      ? { "zh-Hans": "上一幕", ja: "前のチャプター", ko: "이전 장" }[locale] || "Previous chapter"
      : copy.messages[key as keyof typeof copy.messages] || key;
  const root = useRef<HTMLDivElement>(null);
  const engine = useRef<Awaited<ReturnType<typeof mountShowcase>> | null>(null);
  const [state, setState] = useState<State>({
    current: 0,
    playing: false,
    effect: 0,
    color: 0,
    active: false,
  });
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const start = async () => {
      if (!root.current) return;
      try {
        const controller = await mountShowcase(root.current, copy, setState);
        if (cancelled) {
          controller.dispose();
          return;
        }
        engine.current = controller;
        setReady(true);
      } catch (error) {
        console.error("Could not load Moodsk preview", error);
      }
    };
    void start();
    return () => {
      cancelled = true;
      engine.current?.dispose();
      engine.current = null;
    };
  }, [copy]);
  return (
    <div
      className="moodsk-onboarding desktop-showcase"
      id="desktop-preview"
      role="region"
      aria-roledescription="carousel"
      tabIndex={0}
      ref={root}
      data-active={state.active}
      aria-label={text("Desktop preview")}
    >
      <img
        className="showcase-fallback"
        src="/studio/products/moodsk-current.webp"
        alt="Moodsk on Mac"
        width="1600"
        height="1200"
      />
      <div className="showcase-interface">
        <div className="showcase-main">
          <div className="copy">
            <div id="eyebrow" />
            <h2 id="title" />
            <p id="detail" />
          </div>
          <div id="stage" aria-label={text("Desktop preview")} />
        </div>
        <div className="onboarding-controls">
          <nav aria-label={text("Chapters")}>
            <ToggleGroup
              type="single"
              variant="outline"
              value={String(state.current)}
              onValueChange={(value) => {
                if (value) engine.current?.show(Number(value));
              }}
            >
              {copy.scenes.map((scene, i) => (
                <ToggleGroupItem
                  key={scene[0]}
                  value={String(i)}
                  aria-label={scene[0]}
                  aria-current={i === state.current ? "step" : undefined}
                >
                  {String(i + 1).padStart(2, "0")}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </nav>
          <div className="playback-controls">
            <Button
              variant="ghost"
              size="icon"
              aria-label={text("Replay chapter")}
              id="replay"
              disabled={!ready}
              onClick={() => engine.current?.replay()}
            >
              <RotateCcw />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={text(state.playing ? "Pause animation" : "Play animation")}
              id="pause"
              aria-pressed={state.playing}
              disabled={!ready}
              onClick={() => engine.current?.toggle()}
            >
              {state.playing ? <Pause /> : <Play />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label={text("Previous chapter")}
              disabled={!ready}
              onClick={() => engine.current?.show(state.current - 1)}
            >
              <ArrowLeft />
            </Button>
            <Button
              id="next"
              aria-label={text(state.current === 5 ? "Get Moodsk" : "Continue")}
              disabled={!ready}
              onClick={() => engine.current?.next()}
            >
              {text(state.current === 5 ? "Get Moodsk" : "Continue")}
              <ArrowRight data-icon="inline-end" />
            </Button>
          </div>
        </div>
        {state.current === 3 && (
          <div className="cursor-controls">
            <ToggleGroup
              type="single"
              variant="outline"
              value={String(state.effect)}
              onValueChange={(value) => {
                if (value) engine.current?.effect(Number(value));
              }}
              spacing={2}
              className="flex-wrap max-w-full"
              aria-label={text("Bubbles, koi and stardust preview")}
            >
              {["Bubbles", "Koi", "Stardust"].map((name, i) => (
                <ToggleGroupItem key={name} value={String(i)} data-effect={i}>
                  {text(name)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <ToggleGroup
              type="single"
              variant="outline"
              value={String(state.color)}
              onValueChange={(value) => {
                if (value) engine.current?.color(Number(value));
              }}
              spacing={2}
              className="flex-wrap max-w-full"
              aria-label={text("Cursor colours")}
            >
              {["Gold", "Peach", "Green", "Purple", "Blue"].map((name, i) => (
                <ToggleGroupItem
                  key={name}
                  value={String(i)}
                  data-color={i}
                  aria-label={text(name)}
                >
                  {text(name)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        )}
      </div>
    </div>
  );
}
