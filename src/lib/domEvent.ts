import type { Attachment } from "svelte/attachments";

export const staggerIn: Attachment = () => {};

export function onScroll() {
  if (window.scrollY > 0) {
    document.documentElement.classList.add("scrolled");
  } else {
    document.documentElement.classList.remove("scrolled");
  }
}
