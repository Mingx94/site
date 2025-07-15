export function addFont(font: string) {
  if (document.getElementById(`cjk-font-${font}`)) return;

  const url = `https://fonts.googleapis.com/css2?family=${font}&display=swap`;
  const link = document.createElement("link");
  link.id = `cjk-font-${font}`;
  link.href = url;
  link.rel = "stylesheet";
  document.head.appendChild(link);
}

export function toggleFont(font: string) {
  if (font === "iansui") {
    addFont("Iansui");
    document.documentElement.classList.remove("huninn");
  } else {
    addFont("Huninn");
    document.documentElement.classList.add("huninn");
  }
}

export function initFont() {
  const userFont = localStorage.getItem("font") || "huninn";
  if (userFont) {
    toggleFont(userFont);
  }
}
