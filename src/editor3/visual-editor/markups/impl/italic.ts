import {MarkupHandler} from "../markup";
import {prepareSimpleTag} from "./common";

export const ItalicMarkupHandler: MarkupHandler = {
    type: "italic",
    elementType: "markup",
    render: properties => prepareSimpleTag("italic", "em", ["text", "markup", "emphasis"], properties)
}
