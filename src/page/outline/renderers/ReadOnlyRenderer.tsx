import React from "react";

export type IReadOnlyRenderer_ = (props: { content: string }) => JSX.Element;
export type IReadOnlyRenderer = {
  type?: string
  render: IReadOnlyRenderer_
}

export const ReadOnlyRenderer = (
  props: {
    type?: string,
    content: string
    readOnlyRenderers?: IReadOnlyRenderer[],
  }
) => {
  const Renderer = [...props.readOnlyRenderers ?? []].reverse().filter(r => r.type === props.type || r.type === undefined)
    .map(r => r.render)[0]

  if (!Renderer) return <>No read only renderer avialable for type {props.type}</>
  return <Renderer content={props.content}></Renderer>
}
