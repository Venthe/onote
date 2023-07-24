import { Button, Dropdown, Toolbar, Option, webDarkTheme } from "@fluentui/react-components";
import { DocumentSupportPlugin } from "../plugin-types";
import React from "react";
import { RibbonTabPartition } from "../../editor/ribbon/elements/RibbonTabPartition";
import { RibbonToggleButton } from "../../editor/ribbon/elements/RibbonToggleButton";
import { toCommonRibbonElement } from "../plugin";
import { RibbonElementToolbar, RibbonElementToolbarProps } from "../../editor/ribbon/ribbon";

export const DebugPlugin: DocumentSupportPlugin = {
  toolbarElements: [
    {
      name: "Debug",
      Toolbar: (props: RibbonElementToolbarProps) => {
        const commonRibbonElements = toCommonRibbonElement(props)
        const options = [
          { key: "teamsDarkTheme", label: "Teams Dark Theme" },
          { key: "teamsHighContrastTheme", label: "Teams High Contrast Theme" },
          { key: "webDarkTheme", label: "Web Dark Theme" },
          { key: "webLightTheme", label: "Web Light Theme" },
          { key: "teamsLightTheme", label: "Teams Light Theme" }
        ];

        return (
          <Toolbar>
            <RibbonTabPartition {...commonRibbonElements} translationKey="ribbon.debug.debug.partition">
              <Dropdown
                onOptionSelect={(e, data) => { props.actionCallback?.("debug.setTheme", data.optionValue); }}
                placeholder="Select theme">
                {options.map((option) => (
                  <Option key={option.key} value={option.key}>
                    {option.label}
                  </Option>
                ))}
              </Dropdown>
              <RibbonToggleButton {...commonRibbonElements}
                showLabel={true}
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
