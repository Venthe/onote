import {useEffect, useRef} from "react";


export const FlashOnCreate = <T extends HTMLElement>() => {
  const ref = useRef<T>(null)

  useEffect(() => {
    if (ref.current?.style) {
      ref.current.style.transition = "";
      ref.current.style.backgroundColor = "rgba(52,102,227,0.3)";
    }

    setTimeout(() => {
      if (ref.current?.style) {
        ref.current.style.transition = "background-color 0.1s ease";
        ref.current.style.backgroundColor = "unset"
      }
    }, 50)
  }, [])

  return {ref}
}
