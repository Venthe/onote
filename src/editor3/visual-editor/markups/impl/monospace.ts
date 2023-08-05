import {MarkupHandler} from "../markup";
import {prepareSimpleTag} from "./common";

export const MonospaceMarkupHandler: MarkupHandler = {
    type: "monospace",
    elementType: "markup",
    render: properties => prepareSimpleTag("monospace", "span", ["text", "markup", "monospace"], properties)
}
