import React, { useContext } from 'react';
import Asciidoc from "organism-react-asciidoc";
import { DocumentSupportPlugin } from '../plugin-types';
import { ThemeContext } from '../../components/context/themeContext';
import { style } from './style';

export const AsciidocSupport: DocumentSupportPlugin = {
  renderers: {
    readOnly: [
      {
        supportedDocumentTypes: ["asciidoc"],
        render: (props) => {
          return (
            // TODO: Update to new Asciidoc version
            //  I don't know why, but npmVersion = '3.0.2' does not work
            <Asciidoc css='' inlineCSS={style(useContext(ThemeContext).styleString)} options={{ doctype: "book" }}>
              {props.content}
            </Asciidoc>
          );
        }
      }
    ]
  }
}
