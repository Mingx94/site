import type { Attachment } from "svelte/attachments";

let queue: Element[] = [];
let scheduled = false;

export const staggerIn: Attachment = (node) => {
  queue.push(node);

  if (!scheduled) {
    scheduled = true;
    requestAnimationFrame(() => {
      // Fresh browser load → full stagger (120ms per element, cinematic reveal)
      // SPA navigation within same session → fast stagger (40ms, barely noticeable)
      const isRevisit =
        typeof sessionStorage !== "undefined" &&
        sessionStorage.getItem("site:visited") === "1";
      const interval = isRevisit ? 40 : 120;

      queue.forEach((el, i) => {
        setTimeout(() => el.classList.add("show"), i * interval);
      });
      queue = [];
      scheduled = false;

      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem("site:visited", "1");
      }
    });
  }
};

export function onScroll() {
  if (window.scrollY > 0) {
    document.documentElement.classList.add("scrolled");
  } else {
    document.documentElement.classList.remove("scrolled");
  }
}
