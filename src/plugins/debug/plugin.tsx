import { Button, Toolbar } from "@fluentui/react-components";
import { DocumentSupportPlugin } from "../plugin-types";
import React from "react";
import { RibbonTabPartition } from "../../editor/ribbon/elements/RibbonTabPartition";
import { RibbonToggleButton } from "../../editor/ribbon/elements/RibbonToggleButton";
import { toCommonRibbonElement } from "../plugin";

export const DebugPlugin: DocumentSupportPlugin = {
  toolbarElements: [
    {
      name: "Debug",
      toolbar: (props) => {
        const commonRibbonElements = toCommonRibbonElement(props)

        return (
          <Toolbar>
            <RibbonTabPartition {...commonRibbonElements} translationKey="ribbon.debug.debug.partition">
              <RibbonToggleButton {...commonRibbonElements} showLabel={true}
                checked={props.debug}
                commandKey="debug.toggleDebug"
                translationKey="ribbon.debug.action.toggleDebug" />
              {props.debug ? <Button appearance="primary" onClick={() => props.actionCallback?.("debug.drawer.open")}>Show debug</Button> : <></>}
            </RibbonTabPartition>
          </Toolbar>
        );
      }
    }
  ]
}
