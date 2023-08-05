import {MarkupHandler} from "../markup";
import {prepareSimpleTag} from "./common";

export const BoldMarkupHandler: MarkupHandler = {
    type: "bold",
    elementType: "markup",
    render: properties => prepareSimpleTag("bold", "strong", ["text", "markup", "strong"], properties)
}
