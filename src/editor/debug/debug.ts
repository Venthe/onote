import { IPage } from "../../page/Page";

export const examplePage: IPage = {
  version: 1,
  kind: "document/open-note",
  metadata: {
    created: "2023-06-10T08:29:57+0200",
    lastUpdated: "2023-06-11T08:29:57+0200",
    title: "Hello world",
  },
  outlines: {
    "1": {
      metadata: {
        left: 50,
        top: 60,
        width: 400
      },
      content: "This has no renderer whatsoever"
    },
    "2": {
      content: `:toc:
:toc-placement!:
toc::[]

= h1 - test
test

== h2 - test2
* Hello *world*

== h2 - test3
- [ ] option1
- [*] option1`,
      metadata: {
        left: 600,
        top: -100,
        width: 400,
        type: "asciidoc"
      }
    },
    "3": {
      content: `# markdown

## Test

The lift coefficient ($C_L$) is a dimensionless coefficient.

\`\`\`plantuml
Alice->Bob                   
\`\`\`
`
      ,
      metadata: {
        left: 200,
        top: 300,
        width: 400,
        type: 'markdown'
      },
    },
    "4": {
      content: `# TODO

* Outlines:
  * Can be edited
  * Can be created when page is clicked
  * Can be moved via header
  * Can be resized via corner handle
  * Can be resized via side handle
  * Can be deleted by removing all text
* Renderers
  * Read only renderer can be injected
  * Example Markdown RO renderer implemented
  * Example Asciidoc RO renderer implemented
* Ribbon
  * Plugin system based on commands connecting ribbon buttons and text manipulation functions; limited by user-defined types
  * Dynamic/extensible categories (Partially, without helper functions)
  * Example bold and italics (working for Markdown only as an example)

TODO:
* Outline
  * Ability to change type
  * Add file upload
  * Add editable title
  * Add editable creation date
  * Add new handled type - sticky notes
  * Add right-click context menu
* Renderers
  * Add plug-able read-write renderers
  * Add example WYSIWYG editor for markdown
  * Add example WYSIWYG editor for rich text (HTML?)
* Status bar
  * Implement scale in status bar
  * Implement column/row in status bar
* Ribbon
  * Add helper functions to extensible code
  * Add keybinds for commands
  * Add dynamic sizing 
* Other
  * Add undo/redo functionality
  * Style example asciidoc RO renderer
  * Optimize performance
    * remove unnecessary saves
    * remove unnecessary redraws (Memo's?)
    * Streaming file management, partial update?
  * Refactor code from POC (Tests, linting etc.)
  * Support switchable styles
  * Support translations
  * Split the projects to a component/web-app
  * Add export/import of files
  * Add support for dynamic styles for a drop-down. (And subsequently, reading the current style)
  * Outline created/moved outside of the screen is not being smoothly tracked by a viewport (scrollTo)
  * Attachments drag & drop

Known bugs:
* Undo+redo not working
      `,
      metadata: {
        left: 1100,
        width: 400,
        type: 'markdown',
        top: 100
      }
    }
  }
};
