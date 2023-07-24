import React, { Dispatch, SetStateAction, useContext, useMemo } from 'react';
import {
  Skeleton, SkeletonItem,
  Toaster} from '@fluentui/react-components';
import styles from "./Editor.module.css"
import "./Editor.module.css"
import yaml from 'js-yaml'
import { PluginManager } from '../plugins/plugin';
import { CommandRegistryContext } from '../components/context/commandContext';
import { PageContext, CurrentlyEditingStateContext } from '../components/context/documentContext';
import { Page } from '../page/Page';
import { Drawer } from './debug/Drawer';
import { Ribbon } from './ribbon/ribbon';
import { ThemeContext } from '../components/context/themeContext';

export const Editor = (props: { toasterId: string, pluginManager: PluginManager, setDebug: Dispatch<SetStateAction<boolean>> }) => {
  const page = useContext(PageContext)
  document.title = page?.metadata?.title ?? page?.outlines?.[0]?.content?.substring(0, 10) ?? "Untitled";
  const [isDebugDrawerOpen, setIsDebugDrawerOpen] = React.useState(false);
  const currentlyEditingContext = useContext(CurrentlyEditingStateContext)
  const editorContext = { scale: 1 }

  const commandRegistry = useContext(CommandRegistryContext)
  const themeContext = useContext(ThemeContext)

  useMemo(() => commandRegistry.registerCommand("debug.toggleDebug", () => props.setDebug(d => !d)), [])
  useMemo(() => commandRegistry.registerCommand("debug.drawer.open", () => setIsDebugDrawerOpen(true)), [])
  useMemo(() => commandRegistry.registerCommand("debug.setTheme", (data) => themeContext.setTheme(data)), [])

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
