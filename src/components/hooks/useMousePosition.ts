import { useEffect, useState } from "react";

export const useMousePosition = (ref: HTMLElement = document.getElementsByTagName("body")[0]) => {
  const [mousePosition, setMousePosition] = useState<{ x: number, y: number } | undefined>(undefined)
  useEffect(() => {
    const onMouseMove = (e: any) => {
      setMousePosition({ x: e.clientX - (ref?.getBoundingClientRect().left ?? 0), y: e.clientY - (ref?.getBoundingClientRect().top ?? 0) });
    }

    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [ref])

  return mousePosition
}
