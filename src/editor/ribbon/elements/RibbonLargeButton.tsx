import { Button } from "@fluentui/react-components"
import React, { PropsWithChildren } from "react"
import styles from "./RibbonLargeButton.module.scss"
import { CommonRibbonElementProps } from "./types";
import { nameWithAriaTranslation } from "./utilities";

type RibbonLargeButton = {
  icon?: JSX.Element;
  commandKey: string;
  translationKey?: string;
} & CommonRibbonElementProps;

export const RibbonLargeButton = ({ children, ...props }: PropsWithChildren<RibbonLargeButton>) => {
  const { name, ariaAttribute } = nameWithAriaTranslation(props.translationKey, props.translate)
  const executeAction = () => props.actionCallback?.(props.commandKey);
  const isDisabled = !props.isApplicable(props.commandKey)

  return (
    <Button
      size="large"
      disabled={isDisabled}
      {...ariaAttribute}
      className={styles.button} onClick={executeAction} appearance='subtle' icon={props.icon}>{name}</Button>
  )
}

