import { FluentProvider, Theme, teamsDarkTheme, teamsHighContrastTheme, teamsLightTheme, webDarkTheme, webLightTheme } from "@fluentui/react-components";
import React, { PropsWithChildren, createContext, useEffect, useRef, useState } from "react";

export const ThemeContext = createContext<{ styleString: string, setTheme: (key: string) => void }>({ styleString: "", setTheme: () => { throw new Error("!") } });

export const ThemeContextProvider = (props: PropsWithChildren<{ theme: Theme }>) => {
  const [theme, setTheme] = useState(props.theme);
  const styles: string = Object.keys(props.theme).map(key => `--${key}: ${(theme as any)[key]}`).join(";\n")
  const themeRoot = useRef<HTMLStyleElement>(document.createElement('style'))

  useEffect(() => {
    const head = document.querySelector('head');
    themeRoot.current.innerHTML = `:root {${styles}}`
    head?.appendChild(themeRoot.current);

    return () => {
      themeRoot.current.parentElement?.removeChild(themeRoot.current)
    }
  }, [theme])

  const setTheme_ = (key: string) => {
    switch (key) {
      case "teamsDarkTheme":
        setTheme(teamsDarkTheme)
        break;
      case "teamsHighContrastTheme":
        setTheme(teamsHighContrastTheme)
        break;
      case "webLightTheme":
        setTheme(webLightTheme)
        break;
      case "teamsLightTheme":
        setTheme(teamsLightTheme)
        break;
      case "webDarkTheme":
      default:
        setTheme(webDarkTheme)
    }
  }

  return (
    <FluentProvider theme={theme}>
      <ThemeContext.Provider value={{ styleString: styles, setTheme: setTheme_ }}>
        {props.children}
      </ThemeContext.Provider>
    </FluentProvider>
  )
}
