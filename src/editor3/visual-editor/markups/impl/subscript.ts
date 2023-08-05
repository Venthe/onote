import {MarkupHandler} from "../markup";
import {prepareSimpleTag} from "./common";

export const SubscriptMarkupHandler: MarkupHandler = {
    type: "subscript",
    elementType: "markup",
    render: properties => prepareSimpleTag("subscript", "span", ["text", "markup", "subscript"], properties)
}
