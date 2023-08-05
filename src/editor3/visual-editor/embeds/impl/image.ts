import {EmbedHandler} from "../embed";
import {Embed} from "../../types";
import {propertiesToAttributes} from "../../utilities/utilities";

export const ImageEmbedHandler: EmbedHandler = {
    type: "image",
    elementType: "embed",
    parse: (properties = {}) => {
        if (properties["src"]) {
            properties["source"] = properties["src"]
            delete properties["src"]
        }

        return properties
    },
    render(properties = {}): string {
        const src = properties?.["source"]
        if (!src) throw new Error("!!!!!!!")
        const id = properties?.["data-id"]
        if (!id) throw new Error("!!!!!!!!")
        const props = {
            "data-type": "image",
            "data-element-type": "embed",
            "data-id": id,
            "src": src
        }
        return `<img ${propertiesToAttributes(props).join(" ")}/>`
    }
}
