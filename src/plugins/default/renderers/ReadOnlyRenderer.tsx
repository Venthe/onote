import { ReadOnlyRenderer } from "../../plugin-types";
import React from "react";
import styles from './ReadWriteRenderer.module.scss'

export const DefaultRORenderer: ReadOnlyRenderer = (props: { content: string }) => <pre className={styles.readOnlyRenderer}>{props.content}</pre>
