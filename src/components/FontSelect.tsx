import { Fragment } from "preact";
import { useState, useEffect } from "preact/hooks";
import RiFontFamily from "~icons/ri/font-family";

const fontList = [
  {
    name: "芫荽體",
    value: "iansui",
    className: "font-iansui",
  },
  {
    name: "粉圓體",
    value: "huninn",
    className: "font-huninn",
  },
];

const Select = () => {
  const [selectedFont, setSelectedFont] = useState("iansui");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const localFont = localStorage.getItem("font");
    if (localFont) {
      setSelectedFont(localFont);
    }
  }, []);

  return (
    <Fragment>
      <div class="relative">
        <button
          type="button"
          class="border-border grid w-full cursor-default grid-cols-1 rounded-md border bg-transparent py-1.5 pr-2 pl-3 text-left sm:text-sm/6"
          aria-haspopup="listbox"
          aria-expanded="true"
          aria-labelledby="listbox-label"
          onClick={() => {
            setIsOpen(!isOpen);
          }}
        >
          <span class="col-start-1 row-start-1 flex items-center gap-2 pr-6">
            <RiFontFamily class="size-4" />
            <span class="block truncate">
              {fontList.find((font) => font.value === selectedFont)?.name}
            </span>
          </span>
          <svg
            class="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
            data-slot="icon"
          >
            <path
              fill-rule="evenodd"
              d="M5.22 10.22a.75.75 0 0 1 1.06 0L8 11.94l1.72-1.72a.75.75 0 1 1 1.06 1.06l-2.25 2.25a.75.75 0 0 1-1.06 0l-2.25-2.25a.75.75 0 0 1 0-1.06ZM10.78 5.78a.75.75 0 0 1-1.06 0L8 4.06 6.28 5.78a.75.75 0 0 1-1.06-1.06l2.25-2.25a.75.75 0 0 1 1.06 0l2.25 2.25a.75.75 0 0 1 0 1.06Z"
              clip-rule="evenodd"
            ></path>
          </svg>
        </button>

        <ul
          class={`absolute -top-1 z-10 max-h-56 w-full -translate-y-full overflow-auto rounded-md py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-hidden sm:text-sm ${
            isOpen ? "block" : "hidden"
          }`}
          aria-expanded={isOpen}
          tabIndex={-1}
          role="listbox"
          aria-labelledby="listbox-label"
          aria-activedescendant="listbox-option-3"
        >
          {fontList.map((font) => (
            <li
              class={`relative cursor-default py-2 pr-9 pl-3 select-none hover:text-black dark:hover:text-white ${font.className}`}
              id={`listbox-option-${font.value}`}
              onClick={() => {
                const fontValue = font.value;
                setSelectedFont(fontValue);
                setIsOpen(false);
                localStorage.setItem("font", fontValue);

                if (fontValue === "iansui") {
                  document.documentElement.classList.remove("huninn");
                } else {
                  document.documentElement.classList.add("huninn");
                }
              }}
              role="option"
            >
              <div class="flex items-center">
                <span class="block truncate font-normal">{font.name}</span>
              </div>
              <span
                class="absolute inset-y-0 right-0 flex items-center pr-4 aria-hidden:hidden"
                aria-hidden={selectedFont !== font.value}
              >
                <svg
                  class="size-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                  data-slot="icon"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Fragment>
  );
};

export default Select;
