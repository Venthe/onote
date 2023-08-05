import {ElementHandler} from "../element";
import {propertiesToAttributes, replaceDataKey} from "../../utilities/utilities";

export const DocumentElementHandler: ElementHandler = {
    type: "document",
    elementType: "element",
    render: (callback, properties) => {
        if (!properties) {
            properties = {}
        }

        replaceDataKey(properties, "id")
        properties["data-type"] = "document"
        properties["data-element-type"] = "element"

        return `<div class="document" ${propertiesToAttributes(properties).join(" ")}>${callback()}</div>`
    },
    parse: (el: Element, childrenParseCallback) => {
        const id = el.attributes.getNamedItem("data-id")?.value
        if (!id) {
            throw new Error("ID must be present")
        }
        return {
            id,
            type: "document",
            elements: childrenParseCallback([...el.children])
        }
    }
}
