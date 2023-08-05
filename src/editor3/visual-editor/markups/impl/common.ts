import {propertiesToAttributes} from "../../utilities/utilities";

export const prepareSimpleTag = (type: string, tag: string, classes: string[] = [], properties?: Record<string, string>) => {
    const typeProperty = {"data-type": type};
    const attributes = [
        ...propertiesToAttributes({...(properties ?? {}), ...typeProperty}),
        `class="${classes.join(' ')}"`,
        "data-element-type=\"markup\""
    ]
        .map(el => el.trim())
        .filter(el => el.length > 0)
        .sort((a, b) => a.localeCompare(b))
        .join(" ")
    return {
        start: (v: string) => `<${tag}${attributes ? " " + attributes : ""}>${v}`,
        end: (v: string) => `${v}</${tag}>`
    }
}
