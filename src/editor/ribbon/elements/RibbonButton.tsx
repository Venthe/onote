import { Button } from "@fluentui/react-components";
import React from "react";
import { CommonRibbonElementProps } from "./types";
import { nameWithAriaTranslation } from "./utilities";

type RibbonButtonProps = {
  label?: boolean;
  icon?: JSX.Element;
  commandKey: string;
  translationKey?: string;
} & CommonRibbonElementProps;

export const RibbonButton = (props: RibbonButtonProps) => {
  const { name, ariaAttribute } = nameWithAriaTranslation(props.translationKey, props.translate)
  const executeAction = () => props.actionCallback(props.commandKey);
  const isDisabled = !props.isApplicable(props.commandKey)

  return <Button
    onClick={executeAction}
    disabled={isDisabled}
    appearance="subtle"
    name={name}
    value={name}
    {...ariaAttribute}
    icon={props.icon}>{props.label ? name : ""}</Button>;
}
