import { marked } from "marked";
import { gfmHeadingId } from "marked-gfm-heading-id";
import { mangle } from "marked-mangle";
import React from "react";

marked.use(mangle()).use(gfmHeadingId());

const Tabs = ({
  children,
}: {
  children: React.ReactElement<{ value: string }>;
}) => {
  const [active, setActive] = React.useState<number>(0);
  const [defaultFocus, setDefaultFocus] = React.useState<boolean>(false);

  const tabRefs = React.useRef<HTMLElement[]>([]);
  React.useEffect(() => {
    if (defaultFocus) {
      //@ts-ignore
      tabRefs.current[active]?.focus();
    } else {
      setDefaultFocus(true);
    }
  }, [active]);

  const tabLinks = Array.from(
    children.props.value.matchAll(
      /<div\s+data-name="([^"]+)"[^>]*>(.*?)<\/div>/g,
    ),
    (match: RegExpMatchArray) => ({ name: match[1], children: match[0] }),
  );

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLLIElement>,
    index: number,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      setActive(index);
    } else if (event.key === "ArrowRight") {
      setActive((active + 1) % tabLinks.length);
    } else if (event.key === "ArrowLeft") {
      setActive((active - 1 + tabLinks.length) % tabLinks.length);
    }
  };

  return (
    <div className="tab">
      <ul className="tab-nav">
        {tabLinks.map(
          (item: { name: string; children: string }, index: number) => (
            <li
              key={index}
              className={`tab-nav-item ${index === active && "active"}`}
              role="tab"
              tabIndex={index === active ? 0 : -1}
              onKeyDown={(event) => handleKeyDown(event, index)}
              onClick={() => setActive(index)}
              //@ts-ignore
              ref={(ref) => (tabRefs.current[index] = ref)}
            >
              {item.name}
            </li>
          ),
        )}
      </ul>
      {tabLinks.map((item: { name: string; children: string }, i: number) => (
        <div
          className={active === i ? "tab-content block px-5" : "hidden"}
          key={i}
          dangerouslySetInnerHTML={{
            __html: marked.parse(item.children) as string,
          }}
        />
      ))}
    </div>
  );
};

export default Tabs;
