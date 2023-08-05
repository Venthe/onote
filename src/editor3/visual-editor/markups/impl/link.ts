import {MarkupHandler} from "../markup";
import {prepareSimpleTag} from "./common";

export const LinkMarkupHandler: MarkupHandler = {
    type: "link",
    elementType: "markup",
    render: properties => {
        const href = properties?.["url"] ?? ""

        return prepareSimpleTag("link", "a", ["text", "markup", "link"], {href})
    },
    processProperties: (properties = {}) => {
        if (properties["href"]) {
            properties["url"] = properties["href"]
            delete properties["href"]
        }

        return properties
    }
}
