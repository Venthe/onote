import React from "react";
import styles from "./RibbonToggleButton.module.scss"
import { CommonRibbonElementProps } from "./types";
import { nameWithAriaTranslation } from "./utilities";
import { ToggleButton } from "@fluentui/react-components";

type RibbonToggleButtonProps = {
  checked?: boolean
  icon?: JSX.Element;
  commandKey: string;
  translationKey?: string;
  showLabel?: boolean;
} & CommonRibbonElementProps;

export const RibbonToggleButton = (props: RibbonToggleButtonProps) => {
  const { name, ariaAttribute } = nameWithAriaTranslation(props.translationKey, props.translate)
  const executeAction = () => props.actionCallback(props.commandKey);
  const label = props.showLabel ? name : "";
  const isChecked = props.checked ?? props.isEnabled(props.commandKey)
  const isDisabled = !props.isApplicable(props.commandKey)

  return (
    <ToggleButton
      {...ariaAttribute}
      checked={isChecked}
      disabled={isDisabled}
      onClick={executeAction}
      className={styles.button}
      appearance="subtle"
      name={name}
      value={name}
      icon={props.icon}>{label}</ToggleButton>
  )
}
