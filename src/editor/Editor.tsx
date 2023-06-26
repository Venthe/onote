import React, { Dispatch, SetStateAction, useContext, useMemo, useRef, useState } from 'react';
import {
  Skeleton, SkeletonItem,
  Toaster,
  useId,
  useToastController,
  ToastBody,
  Toast,
  ToastTitle
} from '@fluentui/react-components';
import styles from "./Editor.module.css"
import "./Editor.module.css"
import yaml from 'js-yaml'
import { clone } from '../utilities/utilities';
import { MarkdownSupport } from '../plugins/markdown/plugin';
import { AsciidocSupport } from '../plugins/asciidoc/plugin';
import { PluginManager } from '../plugins/plugin';
import { DefaultDocumentSupport } from '../plugins/default/plugin';
import { DebugPlugin } from '../plugins/debug/plugin';
import { CommandRegistryContext } from '../components/context/commandContext';
import { PageContext, CurrentlyEditingStateContext } from '../components/context/documentContext';
import { EditorContext } from '../components/context/editorContext';
import { IPage, Page } from '../page/Page';
import { Drawer } from './debug/Drawer';
import { examplePage } from './debug/debug';
import { Ribbon } from './ribbon/ribbon';

export const Editor = () => {
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
      <Editor_ toasterId={toasterId} pluginManager={pluginManager.current} setDebug={setDebug} />
    </EditorContext>
  )
}

const Editor_ = (props: { toasterId: string, pluginManager: PluginManager, setDebug: Dispatch<SetStateAction<boolean>> }) => {
  const page = useContext(PageContext)
  document.title = page?.metadata?.title ?? page?.outlines?.[0]?.content?.substring(0, 10) ?? "Untitled";
  const [isDebugDrawerOpen, setIsDebugDrawerOpen] = React.useState(false);
  const currentlyEditingContext = useContext(CurrentlyEditingStateContext)
  const editorContext = { scale: 1 }

  const commandRegistry = useContext(CommandRegistryContext)

  useMemo(() => commandRegistry.registerCommand("debug.toggleDebug", () => props.setDebug(d => !d)), [])
  useMemo(() => commandRegistry.registerCommand("debug.drawer.open", () => setIsDebugDrawerOpen(true)), [])

  return (
    <>
      <div id={styles.EditorComposerRoot}>
        <Ribbon
          id={styles.Ribbon}
          tabs={props.pluginManager.tabs}
          metadata={{ scale: editorContext.scale ?? 1, isEditing: !!currentlyEditingContext }} />
        <Page readOnlyRenderers={props.pluginManager.readOnlyRenderers}
          editableRenderers={props.pluginManager.editableRenderers}>
          <PageSkeleton />
        </Page>
        <div id={styles.StatusBar}>Scale {Math.round((editorContext.scale ?? 1) * 100)}% Type {currentlyEditingContext?.documentType ?? "Undefined"} Id: {currentlyEditingContext?.id}</div>
      </div>
      <Drawer header='Debug drawer' isOpen={isDebugDrawerOpen} onStateChange={(state) => setIsDebugDrawerOpen(state)}>
        <pre>{yaml.dump(page)}</pre>
      </Drawer>
      <Toaster toasterId={props.toasterId} />
    </>
  );
}

const PageSkeleton = () => <Skeleton>
  <SkeletonItem style={{ marginBottom: "1rem", maxWidth: "20%" }} />
  <SkeletonItem style={{ marginBottom: "1rem" }} />
  <SkeletonItem style={{ marginBottom: "1rem" }} />
  <SkeletonItem style={{ marginBottom: "1rem" }} />
  <SkeletonItem style={{ marginBottom: "1rem" }} />
</Skeleton>;
