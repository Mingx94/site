import { Fragment, useEffect, useState } from "react";
import RiFontFamily from "~icons/ri/font-family";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [selectedFont, setSelectedFont] = useState("iansui");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const localFont = localStorage.getItem("font");
    if (localFont) {
      setSelectedFont(localFont);
    }
  }, []);

  return (
    <Select value={selectedFont} onValueChange={setSelectedFont}>
      <SelectTrigger>
        <SelectValue placeholder="選擇字體" />
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
