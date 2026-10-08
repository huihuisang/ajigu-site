import { Fragment } from "react";

export function Lines({ text }: { text: string }) {
  return text.split(/<br\s*\/?>|\n/i).map((line, index) => (
    <Fragment key={index}>
      {index > 0 && <br />}
      {line}
    </Fragment>
  ));
}
