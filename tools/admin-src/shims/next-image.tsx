import React from "react";

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "width" | "height"> & {
  src: string; width?: number; height?: number; fill?: boolean; unoptimized?: boolean; priority?: boolean; preload?: boolean; sizes?: string; quality?: number;
};

/** Maps "/uploads/..." to the real WordPress uploads URL and emulates next/image's fill mode. */
export function resolveSrc(src: string): string {
  const base = window.SH_ADMIN?.uploadsBase;
  if (src && src.indexOf("/uploads/") === 0 && base) return base + "/" + src.slice(9).split("/").map(encodeURIComponent).join("/");
  return src;
}

export default function Image({ src, width, height, fill, unoptimized: _u, priority: _p, preload: _pl, quality: _q, sizes: _s, style, ...rest }: Props) {
  const st: React.CSSProperties = fill
    ? { position: "absolute", height: "100%", width: "100%", left: 0, top: 0, right: 0, bottom: 0, color: "transparent", ...style }
    : { color: "transparent", ...style };
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={resolveSrc(src)} width={fill ? undefined : width} height={fill ? undefined : height} style={st} {...rest} />;
}
