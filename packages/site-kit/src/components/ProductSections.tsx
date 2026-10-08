import { formatShortText } from "../copy";
import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@ajigu/ui/components/accordion";
import { EditorialSection } from "./EditorialSection";
import type { EditorialSection as Section } from "../models";
export function ProductSections({ sections }: { sections: Section[] }) {
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState("");
  useEffect(() => {
    setReady(true);
    const readHash = (hash: string) => {
      try {
        return decodeURIComponent(hash.slice(1));
      } catch {
        return "";
      }
    };
    const reveal = () => setOpen(readHash(location.hash));
    const follow = (event: MouseEvent) => {
      const anchor =
        event.target instanceof Element
          ? event.target.closest<HTMLAnchorElement>('a[href^="#"]')
          : null;
      if (!anchor) return;
      const id = readHash(anchor.getAttribute("href") || "");
      if (sections.some((section) => section.id === id)) setOpen(id);
    };
    reveal();
    window.addEventListener("hashchange", reveal);
    document.addEventListener("click", follow);
    return () => {
      window.removeEventListener("hashchange", reveal);
      document.removeEventListener("click", follow);
    };
  }, [sections]);
  const features = sections.find((s) => s.id === "features");
  const rest = sections.filter((s) => !["features", "faq", "download"].includes(s.id));
  const faq = sections.find((s) => s.id === "faq");
  const download = sections.find((s) => s.id === "download");
  return (
    <>
      {features && <EditorialSection section={features} />}
      {!ready && rest.map((s) => <EditorialSection key={s.id} section={s} />)}
      {ready && rest.length > 0 && (
        <div className="studio-shell product-details">
          <Accordion type="single" collapsible value={open} onValueChange={setOpen}>
            {rest.map((s) => (
              <AccordionItem key={s.id} value={s.id} id={s.id}>
                <AccordionTrigger>{formatShortText(s.title)}</AccordionTrigger>
                <AccordionContent>
                  <EditorialSection section={{ ...s, id: `content-${s.id}`, title: "" }} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
      {faq && <EditorialSection section={faq} />}{" "}
      {download && <EditorialSection section={download} />}
    </>
  );
}
