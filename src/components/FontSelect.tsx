import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";

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

const FontSelect = () => {
  const [selectedFont, setSelectedFont] = React.useState("iansui");

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const localFont = localStorage.getItem("font");
    if (localFont) {
      setSelectedFont(localFont);
    }
  }, []);

  const handleChange = (value: string) => {
    setSelectedFont(value);

    localStorage.setItem("font", value);

    if (value === "huninn") {
      document.documentElement.classList.add("huninn");
    } else {
      document.documentElement.classList.remove("huninn");
    }
  };

  const fontClassName = fontList.find(
    (font) => font.value === selectedFont,
  )?.className;

  return (
    <Select value={selectedFont} onValueChange={handleChange}>
      <SelectTrigger className={fontClassName}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {fontList.map((font) => (
          <SelectItem
            key={font.value}
            value={font.value}
            className={font.className}
          >
            {font.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default FontSelect;
