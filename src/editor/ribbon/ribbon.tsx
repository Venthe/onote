import React, { PropsWithChildren, useCallback, useContext, useState } from 'react';
import {
  Tab,
  TabList,
} from "@fluentui/react-components";
import "./ribbon.scss"
import { ActionCallback, CommandContext, CommandRegistryContext } from '../../components/context/commandContext';
import { DebugContext } from '../../components/context/editorContext';
import { hide } from '../../utilities/styles';
import { TranslationContext, TranslationFunction } from '../../components/context/translationContext';

export interface RibbonProps {
  size?: 'small' | 'medium' | 'large';
  id?: string | undefined,
  tabs: RibbonElement[]
  // commands?: { type: string | undefined, key: string }[]
  metadata?: {
    scale: number
    isEditing: boolean
    outline?: {
      id: string
      type?: string,
    }
  }
}

export const Ribbon = ({ ...props }: RibbonProps) => {
  const debug = useContext(DebugContext) ?? false;
  const commands = useContext(CommandContext);
  const commandRegistry = useContext(CommandRegistryContext);
  const translate = useContext(TranslationContext)

  const [selectedTabId, setSelectedTabId] = useState(props.tabs[0]?.id);
  const [isHidden, setHidden] = useState(false);

  const handleTabSelect = useCallback((tabId: string) => {
    console.debug("Ribbon", "handleTabSelect", tabId, selectedTabId)
    if (tabId === selectedTabId) {
      return
    }
    setSelectedTabId(tabId);
  }, [selectedTabId]);

  const tabs = provideTabs(props.tabs, translate);

  const panels = props.tabs
    .filter(element => element.id === selectedTabId)
    .map(element => (
      <div className="ribbon__panel" key={element.id} role="tabpanel">
        {
          element.toolbar({
            actionCallback: commands.actionCallback,
            debug,
            translate,
            isApplicable: key => commandRegistry.isApplicable(key),
            isEnabled: key => commandRegistry.isEnabled(key)
          })
        }
      </div>
    ));

  return (
    <div id={props.id} className="ribbon">
      <TabList
        className='ribbon__tabs'
        size={props.size}
        selectedValue={selectedTabId}
        onDoubleClick={() => setHidden(!isHidden)}
        onTabSelect={(_, d) => handleTabSelect(d.value as string)}>
        {tabs}
      </TabList>
      <div className="ribbon__panels" style={hide(isHidden)}>
        {panels}
      </div>
    </div>
  );
};

export const cellSize = (size: number) => `calc(${size} * var(--cell-size))`

// #region Types
export type RibbonElement = {
  id: string;
  name: string;
  icon?: JSX.Element;
  toolbar: RibbonElementToolbar
};

export type RibbonElementToolbar = (props: PropsWithChildren<{
  debug: boolean;
  actionCallback: ActionCallback;
  translate: TranslationFunction;
  isApplicable: (commandKey: string) => boolean;
  isEnabled: (commandKey: string) => boolean;
}>) => JSX.Element;
// #endregion Types

function provideTabs(tabs: RibbonElement[], translate: TranslationFunction) {
  return tabs.map((tab) => {
    const icon = tab.icon ? { icon: (<span>{tab.icon}</span>) } : {};

    return (
      <Tab key={tab.id} value={tab.id} {...icon}>{translate(tab.name)}</Tab>
    );
  });
}
