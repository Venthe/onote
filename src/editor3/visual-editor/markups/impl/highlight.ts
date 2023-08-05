import {MarkupHandler} from "../markup";
import {prepareSimpleTag} from "./common";
import {replaceDataKey} from "../../utilities/utilities";

export const HighlightMarkupHandler: MarkupHandler = {
    elementType: "markup",
    type: "highlight",
    render: (properties = {}) => {
        properties["backgroundColor"] = properties["backgroundColor"] ?? "#ffff00"
        const style = {style: `background-color: ${properties["backgroundColor"]}`}

        replaceDataKey(properties ?? {}, "backgroundColor")

        return prepareSimpleTag("highlight", "span", ["text", "markup", "highlight"], {...style, ...properties});
    }
}
