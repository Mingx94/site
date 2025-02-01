import type { ComponentChildren } from "preact";

function Tab({
  name,
  children,
}: {
  name: string;
  children: ComponentChildren;
}) {
  return <div data-name={name}>{children}</div>;
}

export default Tab;
