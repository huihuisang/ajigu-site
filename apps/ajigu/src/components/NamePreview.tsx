import { ArrowUpRight } from "@ajigu/ui/icons";
import { useEffect, useState } from "react";
import { Input } from "@ajigu/ui/components/input";
import { Button } from "@ajigu/ui/components/button";
import { DeskCard } from "@ajigu/site-kit/components/DeskCard";
import { FieldGroup, Field, FieldLabel, FieldDescription } from "@ajigu/ui/components/field";
import { getCopy } from "@ajigu/site-kit/copy";

export default function NamePreview({ locale, editor }: { locale: string; editor: string }) {
  const copy = getCopy(locale);
  const [name, setName] = useState(copy.sampleName);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return (
    <div className="demo-surface nameplate-demo" data-nameplate-demo>
      <FieldGroup className="nameplate-controls">
        <Field>
          <FieldLabel htmlFor="preview-name">{copy.name}</FieldLabel>
          <FieldDescription>{copy.nameHint}</FieldDescription>
          <Input
            id="preview-name"
            disabled={!ready}
            data-name-input
            maxLength={48}
            autoComplete="off"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Button asChild>
            <a href={editor}>
              {copy.openEditor} <ArrowUpRight data-icon="inline-end" aria-hidden="true" />
            </a>
          </Button>
        </Field>
      </FieldGroup>
      <div className="nameplate-preview">
        <DeskCard name={name.trim() || copy.sampleName} live />
      </div>
    </div>
  );
}
