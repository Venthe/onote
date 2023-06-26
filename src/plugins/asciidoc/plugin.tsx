import React from 'react';
import Asciidoc from "organism-react-asciidoc";
import { DocumentSupportPlugin } from '../plugin-types';

export const AsciidocSupport: DocumentSupportPlugin = {
  renderers: {
    readOnly: [
      {
        supportedDocumentTypes: ["asciidoc"],
        render: (props) => (
          // TODO: Update to new Asciidoc version
          //  I don't know why, but npmVersion = '3.0.2' does not work
          // TODO: Add custom CSS styles
          <Asciidoc options={{ doctype: "book" }}>
            {props.content}
          </Asciidoc>
        )
      }
    ]
  }
}
