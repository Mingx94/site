import type { Attachment } from "svelte/attachments";

let queue: Element[] = [];
let scheduled = false;

export const staggerIn: Attachment = (node) => {
  queue.push(node);

  if (!scheduled) {
    scheduled = true;
    requestAnimationFrame(() => {
      queue.forEach((el, i) => {
        setTimeout(() => el.classList.add("show"), i * 150);
      });
      queue = [];
      scheduled = false;
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
