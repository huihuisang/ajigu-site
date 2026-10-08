import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@ajigu/ui/components/accordion";
import type { Question } from "../models";
export function Faq({ title, questions }: { title: string; questions: Question[] }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return (
    <section className="content-section studio-shell studio-faq" id="faq">
      <h2>{title}</h2>
      {ready ? (
        <Accordion type="single" collapsible defaultValue="question-0">
          {questions.map(({ question, answer }, i) => (
            <AccordionItem key={question} value={`question-${i}`}>
              <AccordionTrigger>{question}</AccordionTrigger>
              <AccordionContent>
                <div className="prose" dangerouslySetInnerHTML={{ __html: answer }} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="faq-static">
          {questions.map(({ question, answer }) => (
            <article key={question}>
              <h3>{question}</h3>
              <div className="prose" dangerouslySetInnerHTML={{ __html: answer }} />
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
