import { useState, useEffect, useRef } from "react";

export const useMouseMovement = () => {
  const [mousePosition, setMousePosition] = useState<{ x: number, y: number } | undefined>(undefined)

  useEffect(() => {
    const onMouseMove = (e: any) => {
      setMousePosition({ x: e.movementX, y: e.movementY });
    }

    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [])

  return mousePosition
}
