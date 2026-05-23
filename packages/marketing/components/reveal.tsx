"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/* Scroll-reveal: every element with .reveal animates in once it intersects.
   Re-runs on client navigation (pathname dep) so interior pages reveal too. */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in-view");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "-60px 0px -80px 0px", threshold: 0.05 },
    );
    // Defer one frame so freshly navigated DOM is committed.
    const id = requestAnimationFrame(() => {
      document.querySelectorAll(".reveal:not(.in-view)").forEach((el) => io.observe(el));
    });
    return () => {
      cancelAnimationFrame(id);
      io.disconnect();
    };
  }, [pathname]);

  return null;
}
