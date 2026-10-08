import type { ImgHTMLAttributes } from "react";
import catalog from "../../media.json";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & { file: string; eager?: boolean };

export function Media({ file, eager = false, alt = "", ...props }: Props) {
  const name = file.replace(/\.(?:png|jpg)$/, ".webp");
  const dimensions = catalog[name as keyof typeof catalog];
  if (!dimensions) throw new Error(`Missing shared media: ${name}`);
  return (
    <img
      src={`/studio/media/${name}`}
      alt={alt}
      width={dimensions.width}
      height={dimensions.height}
      decoding="async"
      loading={eager ? undefined : "lazy"}
      fetchPriority={eager ? "high" : undefined}
      {...props}
    />
  );
}
