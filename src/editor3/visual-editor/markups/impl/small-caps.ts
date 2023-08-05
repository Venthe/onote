import {MarkupHandler} from "../markup";
import {prepareSimpleTag} from "./common";

export const SmallCapsMarkupHandler: MarkupHandler = {
    type: "small-caps",
    elementType: "markup",
    render: properties => prepareSimpleTag("small-caps", "span", ["text", "markup", "small-caps"], properties)
}
