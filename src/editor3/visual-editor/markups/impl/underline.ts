import {MarkupHandler} from "../markup";
import {prepareSimpleTag} from "./common";

export const UnderlineMarkupHandler: MarkupHandler = {
    type: "underline",
    elementType: "markup",
    render: properties => prepareSimpleTag("underline", "span", ["text", "markup", "underline"], properties)
}
