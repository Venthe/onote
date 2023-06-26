import { ignoringWhitespaceSelectionHelper } from "../../utilities/text";
import ReactMarkdown from "react-markdown";
import simplePlantUML from "@akebifiky/remark-simple-plantuml"
import React, { useRef } from 'react';
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { DocumentSupportPlugin } from "../plugin-types";

export const MarkdownSupport: DocumentSupportPlugin = {
  documentMapping: [
    { from: "md", to: "markdown" },
    { from: "markdown", to: "markdown" }
  ],
  renderers: {
    readOnly: [
      {
        supportedDocumentTypes: ["markdown"],
        render: (props) => {
          const { current: remarkPlugins } = useRef([remarkMath, simplePlantUML])
          const { current: rehypePlugins } = useRef([rehypeKatex])

          return (
            <ReactMarkdown
              remarkPlugins={remarkPlugins}
              rehypePlugins={rehypePlugins}>
              {props.content}
            </ReactMarkdown>
          );
        }
      }
    ]
  },
  commands: [
    {
      isApplicable: (props) => props.documentType === "markdown",
      type: "replaceText",
      selection: "selection",
      commandKey: "home.basicText.bold",
      action: (text) => ignoringWhitespaceSelectionHelper(text, (v: string) => `**${v}**`)
    },
    {
      isApplicable: (props) => props.documentType === "markdown",
      type: "replaceText",
      selection: "selection",
      commandKey: "home.basicText.italic",
      action: (text) => ignoringWhitespaceSelectionHelper(text, (v: string) => `*${v}*`)
    }
  ]
}
