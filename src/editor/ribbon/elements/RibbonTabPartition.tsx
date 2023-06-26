import React, { PropsWithChildren } from "react"
import styles from "./RibbonTabPartition.module.scss"
import { CommonRibbonElementProps } from "./types"

type RibbonTabPartitionProps = {
  translationKey: string
} & CommonRibbonElementProps

export const RibbonTabPartition = (props: PropsWithChildren<RibbonTabPartitionProps>) => {

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {props.children}
      </div>
      <div className={styles.title}>{props.translate(props.translationKey + ".name")}</div>
    </div>
  )
}
