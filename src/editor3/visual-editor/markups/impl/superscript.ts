import {MarkupHandler} from "../markup";
import {prepareSimpleTag} from "./common";

export const SuperscriptMarkupHandler: MarkupHandler = {
    type: "superscript",
    elementType: "markup",
    render: properties => prepareSimpleTag("superscript", "span", ["text", "markup", "superscript"], properties)
}
