import React from "react";
import { navigate } from "./next-navigation";

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; prefetch?: boolean };

export default function Link({ href, onClick, prefetch: _p, ...rest }: Props) {
  return (
    <a
      href={href}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || rest.target === "_blank") return;
        if (/^\/admin(\/|$|\?)/.test(href)) { e.preventDefault(); navigate(href); }
      }}
    />
  );
}
