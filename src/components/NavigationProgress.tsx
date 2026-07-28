"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";

NProgress.configure({
  showSpinner: false,
  trickleSpeed: 100,
  minimum: 0.15,
  speed: 400,
  easing: "ease",
});

function NavigationProgressInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeRef = useRef(false);

  useEffect(() => {
    if (!activeRef.current) return;
    const timer = window.setTimeout(() => {
      NProgress.done();
      activeRef.current = false;
    }, 280);
    return () => window.clearTimeout(timer);
  }, [pathname, searchParams]);

  useEffect(() => {
    const start = () => {
      if (activeRef.current) return;
      activeRef.current = true;
      NProgress.start();
    };

    const onClick = (event: MouseEvent) => {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        return;
      }
      if (anchor.hasAttribute("download") || anchor.target === "_blank") return;

      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
        if (
          url.pathname === window.location.pathname &&
          url.search === window.location.search
        ) {
          return;
        }
        start();
      } catch {
        // ignore invalid hrefs
      }
    };

    const onPopState = () => start();

    // Capture phase so we start before Next.js Link calls preventDefault
    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  return null;
}

export function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <NavigationProgressInner />
    </Suspense>
  );
}
