import {MarkupHandler} from "../markup";
import {prepareSimpleTag} from "./common";

export const StrikethroughMarkupHandler: MarkupHandler = {
    type: "strikethrough",
    elementType: "markup",
    render: properties => prepareSimpleTag("strikethrough", "span", ["text", "markup", "strikethrough"], properties)
}
