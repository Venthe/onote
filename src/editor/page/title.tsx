import React from "react";
import './title.scss'

export interface TitleProps {
    title?: string
    created: string
}

export const Title = (props: TitleProps) => (
    <div className='title'>
        <h1 className="title__header">{props.title ?? ""}</h1>
        <hr className="title__divider" />
        <span className="title_creationDate">{new Date(props.created).toISOString()}</span>
    </div>
)
