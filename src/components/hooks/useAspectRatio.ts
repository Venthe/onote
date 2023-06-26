import { useEffect, useRef } from "react";

export const useAspectRatio = () => {
  const aspect = useRef(1);
  useEffect(() => {
    const handleResize = () => {
      aspect.current = window.innerWidth / window.innerHeight;
    }

    window.addEventListener('load', handleResize);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('load', handleResize);
      window.removeEventListener('resize', handleResize);
    };

  }, []);

  return aspect.current
}
