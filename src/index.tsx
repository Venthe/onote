import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { reportWebVitals } from './reportWebVitals'
import { FluentProvider, webDarkTheme, webLightTheme } from '@fluentui/react-components';
import { App } from './App';
import { ThemeContextProvider } from './components/context/themeContext';
import {Editor2} from "./editor2/Editor2";
import {Editor3} from "./editor3/Editor3";
import {Application} from "./mockup/Application";

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error();
const root = ReactDOM.createRoot(rootElement);

root.render(
  // When developing in “Strict Mode”, React calls each component’s function twice, which can help surface mistakes caused by impure functions.
  <React.StrictMode>
      <Editor3></Editor3>
    {/*<ThemeContextProvider theme={webDarkTheme}>*/}
    {/*  <App />*/}
    {/*</ThemeContextProvider>*/}
    {/*  <Application/>*/}
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
