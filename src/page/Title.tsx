import React, { useRef } from "react";
import styles from './Title.module.css'
import { IPageMetadata } from "./Page";

export interface TitleProps {
  title?: string
  created: string,
  onChange?: (metadata: Omit<IPageMetadata, "lastUpdated">) => void
}

export const Title = (props: TitleProps) => {
  const title = useRef(props.title)

  return (
    <div className={styles.titleContainer}>
      <div className={styles.title}>
        <h1 className={styles.header}>{title.current ?? ""}</h1>
        <hr className={styles.divider} />
        <span className={styles.creationDate}>{new Date(props?.created ?? "").toLocaleDateString()}</span><span style={{ paddingLeft: "5rem", whiteSpace: "nowrap" }}>{new Date(props?.created ?? "").toLocaleTimeString()}</span>
      </div>
    </div>
  );
}
