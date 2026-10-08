import { formatShortText } from "../copy";
import { Badge } from "@ajigu/ui/components/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@ajigu/ui/components/card";
import { LinkButton } from "@ajigu/ui/components/link-button";
import { Faq } from "./Faq";
import type { EditorialSection as Section } from "../models";
export function EditorialSection({ section }: { section: Section }) {
  if (section.questions) return <Faq title={section.title} questions={section.questions} />;
  return (
    <section className="content-section studio-shell" id={section.id}>
      {section.title && <h2>{formatShortText(section.title)}</h2>}
      {section.body && (
        <div className="section-body prose" dangerouslySetInnerHTML={{ __html: section.body }} />
      )}
      {!!section.items?.length && (
        <div className="editorial-grid">
          {section.items.map((item, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle>{formatShortText(item.title)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose" dangerouslySetInnerHTML={{ __html: item.body }} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {!!section.tags?.length && (
        <div className="editorial-tags">
          {section.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      )}
      {!!section.links?.length && (
        <div className="editorial-links">
          {section.links.map((link, i) => (
            <LinkButton
              key={i}
              {...link}
              variant={section.id === "download" ? "default" : "outline"}
            />
          ))}
        </div>
      )}
    </section>
  );
}
