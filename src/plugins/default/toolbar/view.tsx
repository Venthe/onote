import { Toolbar } from "@fluentui/react-components";
import { RibbonElementToolbar } from "../../../editor/ribbon/ribbon";
import { toCommonRibbonElement } from "../../plugin";
import { RibbonTabPartition } from "../../../editor/ribbon/elements/RibbonTabPartition";
import React from "react";

export const ViewToolbar: RibbonElementToolbar = (props) => {
  const commonRibbonElements = toCommonRibbonElement(props)

  return (
    <Toolbar>
      <RibbonTabPartition {...commonRibbonElements} translationKey="ribbon.home.view.partition">View toolbar</RibbonTabPartition>
    </Toolbar>
  );
}
