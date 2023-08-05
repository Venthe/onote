export const propertiesToAttributes = (properties: Record<string, string | undefined>) => normalizeProperties(properties)
    .map(el => {
        if (el.value.trim().length > 0) {
            return `${el.key}="${el.value}"`
        } else {
            return el.key
        }
    })

export const mutateKeyToData = (obj: Record<string, string>, key: string) => {
    obj["data-" + pascalCaseToKebabCase(key)] = obj[key]
}

export function pascalCaseToKebabCase(key: string): string {
    return key.replace(/([a-z0–9])([A-Z])/g, "$1-$2").toLowerCase();
}

export const replaceDataKey = (obj: Record<string, string>, key: string) => {
    mutateKeyToData(obj, key)
    delete obj[key]
}

function normalizeProperties(properties: Record<string, string | undefined>) {
    return Object.keys(properties)
        .map(k => ({key: k, value: properties[k]}))
        .filter(el => el.value !== undefined)
        .map(k => ({key: k.key, value: (k.value ?? "").trim()}));
}

export const getAttributeValue: (el: Element, key: string) => string | undefined = (el, key) => el.attributes.getNamedItem(key)?.value


const camelize = (s: string) => s.replace(/-./g, x => x[1].toUpperCase())

export const getProperties = (attributes: NamedNodeMap, omit: string[] = []) => {
    return ([...attributes] as Attr[])
        .filter(attribute => {
            return !omit.includes(attribute.name);
        })
        .map((a) => {
            const key = camelize(a.name.replace(/^data-/, ""));
            return ({key: key, value: a.value});
        })
        .reduce((acc, val) => {
            acc[val.key] = val.value
            return acc
        }, {} as Record<string, string>)
}
