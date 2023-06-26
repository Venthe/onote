import { ToolbarToggleButton } from "@fluentui/react-components";
import React from "react";
import styles from "./RibbonToggleButton.module.scss"
import { CommonRibbonElementProps } from "./types";
import { nameWithAriaTranslation } from "./utilities";

type RibbonToggleButtonProps = {
  checked?: boolean;
  icon?: JSX.Element;
  commandKey: string;
  translationKey?: string;
  showLabel?: boolean;
} & CommonRibbonElementProps;

export const RibbonToggleButton = (props: RibbonToggleButtonProps) => {
  const { name, ariaAttribute } = nameWithAriaTranslation(props.translationKey, props.translate)
  const executeAction = () => props.actionCallback(props.commandKey);
  const label = props.showLabel ? name : "";
  const isChecked = props.checked ? { checked: props.checked ?? false } : {};
  
  return (
    <ToolbarToggleButton
      {...isChecked}
      {...ariaAttribute}
      onClick={executeAction}
      className={styles.button}
      appearance="subtle"
      name={name}
      value={name}
      icon={props.icon}>{label}</ToolbarToggleButton>
  )
}
