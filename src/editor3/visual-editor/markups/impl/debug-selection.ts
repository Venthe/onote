import {MarkupHandler} from "../markup";
import {prepareSimpleTag} from "./common";

export const DebugSelectionMarkupHandler: MarkupHandler = {
    type: "debug-selection",
    elementType: "markup",
    render: properties => prepareSimpleTag("debug-selection", "span", ["text", "markup", "selection"], properties)
}
