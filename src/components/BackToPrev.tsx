import { Button } from "./ui/button";

const BackToPrev = () => {
  return (
    <Button
      ref={(node) => {
        if (!node) return;
        // if the referrer is the same origin, go back
        if (!document.referrer.includes(window.location.origin)) {
          node.classList.add("hidden");
        }
      }}
      variant="outline"
      className="group py-1.5 pr-3 pl-8"
      onClick={() => {
        window.history.back();
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
      <span className="text-sm">回上一頁</span>
    </Button>
  );
};

export default BackToPrev;
