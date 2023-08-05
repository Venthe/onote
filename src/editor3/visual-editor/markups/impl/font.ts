import {MarkupHandler} from "../markup";
import {prepareSimpleTag} from "./common";
import {pascalCaseToKebabCase, replaceDataKey} from "../../utilities/utilities";

function handleProperty(styles: string[], properties: Record<string, string>, key: string, _default?: string) {
    const existingColor = properties["color"];

    if (existingColor) {
        styles.push(`${pascalCaseToKebabCase(key)}: ${existingColor}`)
        replaceDataKey(properties ?? {}, "color")
    }
}

export const FontMarkupHandler: MarkupHandler = {
    elementType: "markup",
    type: "font",
    render: (properties = {}) => {
        if (!properties) properties = {}
        const styles: string[] = []

        handleProperty(styles, properties, "color")
        handleProperty(styles, properties, "fontFace")
        handleProperty(styles, properties, "fontSize")

        return prepareSimpleTag("font", "span", ["text", "markup", "font"], {...(styles.length > 0 ? {style: styles.join("; ")} : {}), ...properties});
    }
}
