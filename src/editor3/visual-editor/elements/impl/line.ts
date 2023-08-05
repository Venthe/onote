import {ElementHandler} from "../element";
import {getAttributeValue, getProperties, propertiesToAttributes, replaceDataKey} from "../../utilities/utilities";

export const LineElementHandler: ElementHandler = {
    type: "line",
    elementType: "element",
    render: (callback, properties) => {
        if (!properties) {
            properties = {}
        }

        properties["data-type"] = "line"
        properties["data-element-type"] = "element"

        return `<span ${propertiesToAttributes(properties).join(" ")}>${callback()}</span>`
    },
    parse: (el, childrenParseCallback) => {
        const id = getAttributeValue(el, "data-id")
        if (!id) {
            throw new Error("ID must be present")
        }

        return {
            id,
            type: "paragraph",
            elements: childrenParseCallback([...el.children]),
            properties: getProperties(el.attributes, ["data-id", "data-type", "data-element-type"])
        }
    }
}
