import { useToastController, useId, Toast, ToastBody, ToastTitle } from "@fluentui/react-components";
import React, { useRef, useState } from "react"
import { examplePage } from "./editor/debug/debug";
import { IPage } from "./page/Page";
import { AsciidocSupport } from "./plugins/asciidoc/plugin";
import { DebugPlugin } from "./plugins/debug/plugin";
import { DefaultDocumentSupport } from "./plugins/default/plugin";
import { MarkdownSupport } from "./plugins/markdown/plugin";
import { PluginManager } from "./plugins/plugin";
import { EditorContext } from "./components/context/editorContext";
import { clone } from "./utilities/utilities";
import { Editor } from "./editor/Editor";

export const App = () => {
  const toasterId = useId("toaster");
  const { dispatchToast } = useToastController(toasterId);
  const [page, setPage] = useState<IPage | undefined>(examplePage);
  const [debug, setDebug] = useState<boolean>(false)

  const pluginManager = useRef(new PluginManager([DefaultDocumentSupport, MarkdownSupport, AsciidocSupport, DebugPlugin]))

  const commit = (pg: IPage): void => {
    setPage(_ => clone(pg));
    dispatchToast(<Toast><ToastBody>Page updated</ToastBody></Toast>, { intent: 'info' });
    console.debug("Editor", "commit", pg)
  };

  return (
    <EditorContext debug={debug}
      page={page}
      onCommit={commit}
      commands={pluginManager.current.commands}
      notificationCallback={(key, data) => dispatchToast(<Toast><ToastTitle>{key}</ToastTitle><ToastBody>{JSON.stringify(data)}</ToastBody></Toast>, { intent: 'info' })}>
      <Editor toasterId={toasterId} pluginManager={pluginManager.current} setDebug={setDebug} />
    </EditorContext>
  )
}
