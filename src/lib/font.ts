export function toggleFont(font: string) {
  document.documentElement.classList.toggle("reading-sans", font === "sans");
}

export function initFont() {
  toggleFont(localStorage.getItem("font") || "serif");
}
