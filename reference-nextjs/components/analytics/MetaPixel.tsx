"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

interface MetaPixelProps {
  /**
   * Pixel ID resolved server-side at request time (from META_PIXEL_ID) and
   * passed down as a prop. Deliberately NOT read from NEXT_PUBLIC_* here:
   * those are inlined at build time, and the Docker build runs without
   * .env.local (it's dockerignored), which left the production bundle with
   * no pixel at all. A runtime prop works with compose's env_file.
   */
  pixelId: string | null | undefined;
}

/**
 * Meta (Facebook) Pixel.
 *
 * The base snippet (loaded via next/script) fires a PageView on the initial,
 * server-rendered page load. Because the App Router navigates client-side
 * without a full reload, we additionally fire a PageView whenever the pathname
 * changes so SPA navigations are tracked too.
 */
export default function MetaPixel({ pixelId }: MetaPixelProps) {
  const pathname = usePathname();
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (!pixelId) return;
    // The base snippet already tracks the first PageView; skip the duplicate.
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    window.fbq?.("track", "PageView");
  }, [pathname, pixelId]);

  if (!pixelId) return null;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}');
fbq('track', 'PageView');`}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
