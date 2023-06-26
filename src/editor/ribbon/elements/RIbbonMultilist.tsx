import { Skeleton, SkeletonItem } from "@fluentui/react-components"
import React from "react"

export const RibbonMultilist = () => (
  <div style={{ width: "7rem", height: "100%", overflowY: "scroll" }}>
    <Skeleton style={{ display: "flex", flexDirection: "column", height: "200%", justifyContent: "space-between" }}>
      {[...Array(8).keys()].map(i => <SkeletonItem key={i} />)}
    </Skeleton>
  </div >
)
