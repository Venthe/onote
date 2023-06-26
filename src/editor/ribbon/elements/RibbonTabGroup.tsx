import React, { PropsWithChildren } from "react";
import { cellSize } from "../ribbon";
import styles from "./RibbonTabGroup.module.scss"
import "./RibbonTabGroup.scss"

type RibbonTabGroupProps = PropsWithChildren<{
  container?: boolean;
  width?: number;
  height?: number;
  direction?: "row" | "column";
  debug: boolean;
}>

export const RibbonTabGroup = ({ debug = false, height = 1, container = false, ...props }: RibbonTabGroupProps) => {
  const forContainer = container ? { display: "flex" } : {};
  const forWidth = props.width ? { minWidth: cellSize(props.width) } : {};
  const ribbonTabGroupClasses = styles.tabGroup + " ribbon-tab-group " + (debug ? " " + styles.tabGroupDebug : "");
  const direction = props.direction ?? "row";

  return (
    <div className={ribbonTabGroupClasses}
      data-direction={direction}
      style={{
        flexDirection: props.direction,
        ...(forContainer),
        ...(forWidth),
        height: cellSize(height),
        minHeight: cellSize(height)
      }}>
      {props.children}
    </div>
  );
}
