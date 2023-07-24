declare module "*.module.css";
declare module "*.module.scss";
declare module "*.svg";

declare module 'organism-react-asciidoc' {
  export default function Asciidoc(props: React.PropsWithChildren<{
    onLoadDelay?: number,
    inlineCSS?: string | React.CSSProperties,
    js?: string,
    css?: string,
    npmVersion?: string,
    onLoad?: any,
    options?: any,
    attributes?: any
  }>, ref: React.Ref<HTMLIFrameElement>): any
}

declare module '@akebifiky/remark-simple-plantuml'
