import React from 'react';
import ReactMarkdown from 'react-markdown'
import Asciidoc from "organism-react-asciidoc";
import simplePlantUML  from "@akebifiky/remark-simple-plantuml"

import 'katex/dist/katex.min.css' 
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export const rendererFactory = (type: string) => (content: string) => {
    switch (type) {
        case "asciidoc":
            return (
                <Asciidoc options={{ doctype: "book" }}>{content}</Asciidoc>
            );
        case "markdown":
            return (
                <ReactMarkdown
                    remarkPlugins={[remarkMath, simplePlantUML]}
                    rehypePlugins={[rehypeKatex]}
                    >
                    {content}
                </ReactMarkdown>
            );
        default:
            return (<div>{content}</div>)
    }
}