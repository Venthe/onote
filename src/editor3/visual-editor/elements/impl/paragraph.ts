import {ElementHandler} from "../element";
import {getAttributeValue, getProperties, propertiesToAttributes, replaceDataKey} from "../../utilities/utilities";

export const ParagraphElementHandler: ElementHandler = {
    type: "paragraph",
    elementType: "element",
    render: (callback, properties) => {
        if (!properties) {
            properties = {}
        }

        replaceDataKey(properties, "id")
        properties["data-type"] = "paragraph"
        properties["data-element-type"] = "element"

        return `<p ${propertiesToAttributes(properties).join(" ")}>${callback()}</p>`
    },
    parse: (el, childrenParseCallback) => {
        const id = getAttributeValue(el, "data-id")
        if (!id) {
            throw new Error("ID must be present")
        }

        const properties = getProperties(el.attributes, ["data-id", "data-type", "data-element-type"]);
        return {
            id,
            type: "paragraph",
            elements: childrenParseCallback([...el.children]),
            ...(Object.keys(properties).length > 0 ? {properties} : {})
        }
    }
}
