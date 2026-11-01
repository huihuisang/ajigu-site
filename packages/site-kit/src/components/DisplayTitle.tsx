interface Props {
  text: string;
}

/** Keep the source copy intact while giving its second sentence emphasis. */
export function DisplayTitle({ text }: Props) {
  const match = /^(.+?(?:[.!?](?=\s)|[。！？、，]))(\s*)(.+)$/u.exec(text);
  return match ? (
    <>
      <span className="display-lead">{match[1]}</span>
      {match[2]}
      <span className="display-emphasis">{match[3]}</span>
    </>
  ) : (
    <span className="display-lead">{text}</span>
  );
}
