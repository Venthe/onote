import React, { ChangeEventHandler, DragEventHandler, useId } from "react"
import styles from "./FileUpload.module.css"

export const FileUpload = (props: { enabled?: boolean, handleFiles?: (files: FileList | null) => void }) => {
  if (!props.enabled) return <></>

  const id = useId()

  const handleDrag: DragEventHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop: DragEventHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.debug("FileUpload", "handleDrop", e.dataTransfer.files, props)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      props.handleFiles?.(e.dataTransfer.files);
    }
  };

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      console.debug("FileUpload", "handleChange", e.target.files, props)
      props.handleFiles?.(e.target.files);
    }
  };

  return (
    <>
      <form onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()}>
        <input id={id} type="file" className={styles.inputFileUpload} multiple={true} onChange={handleChange} />
      </form>
      <div className={styles.dragFileElement}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop} />
    </>
  );
}
