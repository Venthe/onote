import { Menu, MenuTrigger, MenuButtonProps, SplitButton, MenuPopover } from "@fluentui/react-components"
import React, { PropsWithChildren } from "react"
import "./RibbonSplitButton.scss"
import { CommonRibbonElementProps } from "./types"

type RibbonSplitButtonProps = {
  icon?: JSX.Element
  commandKey: string
} & CommonRibbonElementProps

export const RibbonSplitButton = (props: PropsWithChildren<RibbonSplitButtonProps>) => {
  const executeAction = { onClick: () => props.actionCallback?.(props.commandKey) }
  const isDisabled = !props.isApplicable(props.commandKey)

  return (
    <Menu positioning="below-start">
      <MenuTrigger disableButtonEnhancement>
        {(triggerProps: MenuButtonProps) => (
          <SplitButton primaryActionButton={executeAction}
            disabled={isDisabled}
            className="ribbon-split-button"
            appearance='subtle'
            menuButton={triggerProps}
            icon={props.icon} />
        )}
      </MenuTrigger>

      <MenuPopover>
        {props.children}
      </MenuPopover>
    </Menu>
  )
}
