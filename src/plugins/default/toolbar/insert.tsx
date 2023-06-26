import { Toolbar, ToolbarDivider } from "@fluentui/react-components";
import { RibbonTabPartition } from "../../../editor/ribbon/elements/RibbonTabPartition";
import { RibbonElementToolbar } from "../../../editor/ribbon/ribbon";
import { toCommonRibbonElement } from "../../plugin";
import React from "react";

export const InsertToolbar: RibbonElementToolbar = (props) => {
  const commonRibbonElements = toCommonRibbonElement(props)
  
  return (
    <Toolbar>
      <RibbonTabPartition {...commonRibbonElements} translationKey="ribbon.home.insert.partition"></RibbonTabPartition>
      <ToolbarDivider />
      <RibbonTabPartition {...commonRibbonElements} translationKey="ribbon.home.tables.partition"></RibbonTabPartition>
      <ToolbarDivider />
      <RibbonTabPartition {...commonRibbonElements} translationKey="ribbon.home.files.partition"></RibbonTabPartition>
      <ToolbarDivider />
      <RibbonTabPartition {...commonRibbonElements} translationKey="ribbon.home.images.partition"></RibbonTabPartition>
      <ToolbarDivider />
      <RibbonTabPartition {...commonRibbonElements} translationKey="ribbon.home.media.partition"></RibbonTabPartition>
      <ToolbarDivider />
      <RibbonTabPartition {...commonRibbonElements} translationKey="ribbon.home.links.partition"></RibbonTabPartition>
      <ToolbarDivider />
      <RibbonTabPartition {...commonRibbonElements} translationKey="ribbon.home.recording.partition"></RibbonTabPartition>
      <ToolbarDivider />
      <RibbonTabPartition {...commonRibbonElements} translationKey="ribbon.home.time.partition Stamp"></RibbonTabPartition>
      <ToolbarDivider />
      <RibbonTabPartition {...commonRibbonElements} translationKey="ribbon.home.pages.partition"></RibbonTabPartition>
      <ToolbarDivider />
      <RibbonTabPartition {...commonRibbonElements} translationKey="ribbon.home.symbols.partition"></RibbonTabPartition>
      <ToolbarDivider />
      <RibbonTabPartition {...commonRibbonElements} translationKey="ribbon.home.more.partition"></RibbonTabPartition>
    </Toolbar>
  );
}
