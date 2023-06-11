import React from 'react';
import * as yaml from 'js-yaml'
import ReactDOM, { Root } from 'react-dom/client';
import './index.css';
import { VSCodeApp } from './vscodeApp';
import { VSCode } from './types/vscode';
import { Page } from './page/page';

declare let vscode: VSCode | undefined;

// Opt-in to Webpack hot module replacement
if (module.hot) {
    // Warning! Will crash if this file is failed in compilation due to FullPageReload requiring window.location.reload
    //  https://github.com/microsoft/vscode/issues/145248
    module.hot.accept()
}

console.debug("index.tsx", "Loading main script")

const isRoot = (el: HTMLElement): boolean => !!(Object.keys(el).filter(a => a.includes("_react"))[0])

const rafAsync = () => new Promise(resolve => requestAnimationFrame(resolve))

const checkElement = (): any => {
    const root = document.getElementById('root')
    if (root === null) {
        console.debug("index.tsx", "Root element not found, waiting...")
        return rafAsync().then(() => checkElement());
    }

    console.debug("Root element found")
    return Promise.resolve(root);
}

function isTrue(val: string | null): boolean {
    try {
        return !!JSON.parse(val ?? "");
    } catch {
        return false;
    }
}

(() => checkElement().then((rootElement: HTMLElement) => {
    console.debug("index.tsx", "Rendering React DOM");
    const isDebug = isTrue(rootElement.getAttribute("data-is-debug"));
    const isProduction = isTrue(rootElement.getAttribute("data-is-production"));

    const cR = () => (document as any).__venthe = {
        root: ReactDOM.createRoot(rootElement)
    };

    if (isRoot(rootElement)) {
        console.debug("index.tsx", "Unmounting old root");
        (document as any).__venthe.root.unmount();
    }

    cR();

    try {
        // This fails with exception... Why tho?
        if (vscode === undefined) {
            (document as any).__venthe.root.render(
                <>{"No VSCODE"}</>
            )
        } else {
            (document as any).__venthe.root.render(
                <VSCodeApp {...{ isProduction, isDebug }} />
            )
        }
    } catch (e) {
        const page = {
            metadata: {
                created: "2023-06-10T08:29:57+0200",
                lastUpdated: "2023-06-11T08:29:57+0200",
                title: "Hello world",
            },
            outlines: {
                "1": {
                    metadata: {
                        left: 0,
                        top: 0,
                        width: 400
                    },
                    content: "This has no renderer whatsoever"
                },
                "2": {
                    content: `
:toc:
:toc-placement!:
toc::[]

= h1 - test
test

== h2 - test2
* Hello *world*

== h2 - test3
- [ ] option1
- [*] option1
                    `,
                    metadata: {
                        left: 400,
                        top: -100,
                        width: 400,
                        type: "asciidoc"
                    }
                },
                "3": {
                    content: `
# markdown

The lift coefficient ($C_L$) is a dimensionless coefficient.

\`\`\`plantuml
Alice->Bob                   
\`\`\`
`,
                    metadata: {
                        left: 200,
                        top: 300,
                        width: 400,
                        type: 'markdown'
                    },
                }
            }
        };

        (document as any).__venthe.root.render(
            <>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap-dark-5@1.1.3/dist/css/bootstrap-dark.min.css" rel="stylesheet" />
                <Page isDebug={isDebug} isProduction={isProduction} text={yaml.dump(page)}></Page>
            </>
        )
    }
}
))()