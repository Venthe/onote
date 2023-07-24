import { Menu, MenuTrigger, MenuPopover, MenuButtonProps, SplitButton } from "@fluentui/react-components"
import React, { PropsWithChildren } from "react"
import styles from "./RibbonLargeSplitButton.module.scss"
import { CommonRibbonElementProps } from "./types"
import { nameWithAriaTranslation } from "./utilities"

type RibbonLargeSplitButtonProps = {
  icon?: JSX.Element
  commandKey: string
  translationKey?: string
} & CommonRibbonElementProps

export const RibbonLargeSplitButton = ({ children, ...props }: PropsWithChildren<RibbonLargeSplitButtonProps>) => {
  const { name } = nameWithAriaTranslation(props.translationKey, props.translate)
  const executeAction = { onClick: () => props.actionCallback?.(props.commandKey) }
  const isDisabled = !props.isApplicable(props.commandKey)

  return (
    <Menu positioning="below-end">
      <MenuTrigger disableButtonEnhancement>
        {(triggerProps: MenuButtonProps) => (
          <SplitButton className={styles.button}
            disabled={isDisabled}
            size="large"
            primaryActionButton={executeAction}
            appearance='subtle'
            menuButton={triggerProps}
            icon={props.icon}>{name}</SplitButton>
        )}
      </MenuTrigger>

      <MenuPopover className={styles.menu}>
        {children}
      </MenuPopover>
    </Menu>
  )
}
