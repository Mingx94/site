import { Button } from "./ui/button";

const BackToPrev = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => {
  return (
    <Button variant="outline" className="group py-1.5 pr-3 pl-8" asChild>
      <a
        href={href}
        onClick={(event) => {
          // if the referrer is the same origin, go back
          if (document.referrer.includes(window.location.origin)) {
            event.preventDefault();
            window.history.back();
          }
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="size-4 fill-none stroke-current stroke-2"
        >
          <line
            x1="5"
            y1="12"
            x2="19"
            y2="12"
            className="translate-x-2 scale-x-0 transition-transform duration-300 ease-in-out group-hover:translate-x-0 group-hover:scale-x-100"
          ></line>
          <polyline
            points="12 5 5 12 12 19"
            className="translate-x-1 transition-transform duration-300 ease-in-out group-hover:translate-x-0"
          ></polyline>
        </svg>
        <div className="text-sm">{children}</div>
      </a>
    </Button>
  );
};

export default BackToPrev;
