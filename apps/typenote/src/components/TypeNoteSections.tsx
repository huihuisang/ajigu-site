import { formatShortText } from "@ajigu/site-kit/copy";
import { Card, CardHeader, CardTitle, CardContent } from "@ajigu/ui/components/card";
import type translations from "../content/translations.json";
import { Button } from "@ajigu/ui/components/button";
import { Download, GitHubIcon } from "@ajigu/ui/icons";
import { Lines } from "@ajigu/site-kit/components/Lines";
import { release, repository } from "../content/product";

type Copy = typeof translations.en;
const rules = ["notes", "rest", "up", "down", "extend", "half", "sharp"] as const;

export function Features({ text }: { text: Copy; screenshots: string }) {
  const features = [
    { title: text.feat.focal_h3, body: text.feat.focal_p },
    { title: text.feat.formats_h3, body: text.feat.formats_p },
    { title: text.feat.instruments_h3, body: text.feat.instruments_p },
    { title: text.feat.menubar_h3, body: text.feat.menubar_p },
  ];
  return (
    <section className="content-section studio-shell" id="features">
      <h2>{formatShortText(text.feat.heading)}</h2>
      <div className="editorial-grid">
        {features.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="prose">{item.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function Notation({ text }: { text: Copy }) {
  return (
    <section className="content-section studio-shell" id="guide">
      <h2>{formatShortText(text.jianpu.title)}</h2>
      <p className="section-description">{text.jianpu.sub}</p>
      <div className="jianpu-rules">
        {rules.map((rule) => (
          <div className="jianpu-rule" key={rule}>
            <code className="rule-token">{text.jianpu[`rule_${rule}`]}</code>
            <span>{text.jianpu[`rule_${rule}_p`]}</span>
          </div>
        ))}
      </div>
      <div className="jianpu-example">
        <p>{text.jianpu.example_label}</p>
        <code className="jianpu-example-code">{text.jianpu.example}</code>
      </div>
    </section>
  );
}

export function Privacy({ text }: { text: Copy }) {
  return (
    <section className="content-section studio-shell" id="privacy">
      <h2>{formatShortText(text.privacy.title)}</h2>
      <p className="section-description">{text.privacy.sub}</p>
      <div className="editorial-grid">
        {([1, 2, 3] as const).map((number) => (
          <Card key={number}>
            <CardHeader>
              <CardTitle>{text.privacy[`p${number}_h`]}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="prose">{text.privacy[`p${number}_p`]}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function DownloadSection({ text }: { text: Copy }) {
  return (
    <section className="content-section studio-shell" id="download">
      <h2 className="cta-title">
        <Lines text={text.cta.title} />
      </h2>
      <p>{text.cta.sub}</p>
      <div className="cta-actions">
        <Button asChild>
          <a href={release} target="_blank" rel="noopener noreferrer">
            <Download data-icon="inline-start" />
            {text.cta.btn1}
          </a>
        </Button>
        <Button asChild variant="outline">
          <a href={repository} target="_blank" rel="noopener noreferrer">
            <GitHubIcon data-icon="inline-start" />
            {text.cta.btn2}
          </a>
        </Button>
      </div>
      <p className="cta-footnote">{text.cta.footnote}</p>
    </section>
  );
}
