export const parseTag = (tag: string) => {
  if (!(tag.startsWith("<") && tag.endsWith(">"))) {
    throw Error("Not a tag")
  }

  if (tag.length < 3) {
    throw Error("Tag too short")
  }

  const attributeRegexp = `[a-zA-Z-]+(?:=['"].*['"])?`
  const result = new RegExp(`<(?<closing>\\/)?\\s*(?<name>\\w+)\\s*(?:(?<attributes>${attributeRegexp})\\s*)*(?<selfClosing>\\/)?\\s*>`, "gm");
  const {
    closing,
    name,
    attributes,
    selfClosing
  } = result.exec(tag)?.groups ?? {};
  return {
    name,
    closing: !!closing,
    selfClosing: !!selfClosing,
    attributes: attributes?.split(new RegExp(`${attributeRegexp}\\s+`, "gm"))
      .map(el => el.trim())
      .map(el => el.split("="))
      .map(el => {
        el[1] = el[1] ? (el[1] as string).substring(1, el[1].length -1) : "true"
        return el
      })
      .map(el => {
        const a: any = {}
        a[el[0]] = el[1]
        return a
      })
      .reduce((acc, val) => ({...acc, ...val}), {})
  }

}
