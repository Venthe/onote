import * as Model from "./types";
import {Embed, Markup} from "./types";
import {EmbedHandlerRegistry} from "./embeds/embed";
import {MarkupHandlerRegistry} from "./markups/markup";
import {getAttributeValue} from "./utilities/utilities";

type UnparsedTag = { text: string, start: number, end?: number, tag?: string };

type Configuration = {
  embedHandlerRegistry: EmbedHandlerRegistry,
  markupHandlerRegistry: MarkupHandlerRegistry
};

export const elementToLineModel = (element: Node | undefined, configuration: Configuration): Model.Line => {
  if (element === undefined) throw new Error("Element is not present, and thus cannot be parsed")

  const isElement = (e: Node): e is Element => e.nodeType === 1;
  if (!isElement(element)) throw new Error("Element must be an ELEMENT_NODE(1) to be parsed")

  const dataId = getAttributeValue(element, "data-id")
  if (!dataId) throw new Error("To be parsed, element must have an ID")

  const {
    parsedText,
    markups,
    embeds
  } = rebuildLineWithProperties(element.innerHTML, configuration)

  return {
    id: dataId,
    content: parsedText,
    ...(Object.keys(embeds).length > 0 ? {embeds} : {}),
    ...(markups.length > 0 ? {markups} : {})
  }
}

const rebuildLineWithProperties = (text: string, configuration: Configuration) => {
  const originalTextLetters = text.split("")
  let rebuildPlainText = ""
  const tags: UnparsedTag[] = []
  // FIXME: tagID might no longer be necessary, as array should work well
  let tagId = -1

  console.debug("Rebuilding line: " + text)

  const markups: Model.Markup[] = []
  const embeds: Model.Embed[] = []
  for (let originalStringIndex = 0; originalStringIndex < originalTextLetters.length; originalStringIndex++) {
    // Start of a tag
    if (originalTextLetters[originalStringIndex] === "<") {
      originalStringIndex++

      let closingTag = false;
      let selfClosingTag = false;
      // Closing tag
      if (originalTextLetters[originalStringIndex] != undefined && originalTextLetters[originalStringIndex] === "/") {
        closingTag = true
        originalStringIndex++;
      } else {
        tagId++
        tags[tagId] = {text: "", start: rebuildPlainText.length}
      }

      let element = ""
      while (originalTextLetters[originalStringIndex] !== ">") {
        element += originalTextLetters[originalStringIndex]
        originalStringIndex++
      }

      const _tagName = tagName(element);
      if (!_tagName) throw new Error("Tag name must be present")
      // Fix IMG tag not being closed by default
      if (_tagName === "img") {
        console.warn("Found IMG tag which has a known issue with DOM, assuming self-closing tag")
        // https://stackoverflow.com/questions/4244434/innerhtml-removing-closing-slash-from-image-tag
        selfClosingTag = true
      }

      if (originalTextLetters[originalStringIndex - 1] === "/") selfClosingTag = true

      if (selfClosingTag) {
        tags[tagId].text = element;
        tags[tagId].tag = _tagName;
        tags[tagId].end = rebuildPlainText.length
        console.debug("Parsed self closing tag " + JSON.stringify({
          ...tags[tagId],
          text: undefined
        }))
        parseTag(tags[tagId], {markups, embeds}, configuration)
      } else if (closingTag) {
        const foundExistingTag = tags.find(el => !el.end && /^(.*)$|^(\w+)\s/.exec(el.text)?.[1] === el.text);
        if (!foundExistingTag) {
          throw new Error("Tried to close a tag that was not parsed yet")
        }
        foundExistingTag.end = rebuildPlainText.length;
        console.debug("Parsed self closing tag " + JSON.stringify({
          ...foundExistingTag,
          text: undefined
        }))
        parseTag(foundExistingTag, {markups, embeds}, configuration)
      } else {
        tags[tagId].tag = _tagName;
        tags[tagId].text = element
        console.debug("Parsed opening tag " + JSON.stringify({
          ...tags[tagId],
          text: undefined
        }))
      }
    }
    // Normal parse
    else {
      rebuildPlainText += originalTextLetters[originalStringIndex]
    }
  }

  console.debug("Parsed tags", JSON.stringify(tags))
  validateEveryTagIsClosed(tags);

  const collapseZeroLengthMarkup: (markup: Markup) => boolean = markup => markup.start !== markup.end;

  return {
    parsedText: rebuildPlainText,
    embeds,
    markups: markups
      .filter(collapseZeroLengthMarkup)
      .reduce((acc, val) => {
        const find = acc.find(el => el.type === val.type && el.end === val.start);

        if (find) {
          find.end = val.end
        } else {
          acc.push(val)
        }
        return acc
      }, [] as Markup[])
  };
}

function validateEveryTagIsClosed(tags: UnparsedTag[]) {
  const isThereAnyUnclosedTag = tags.map(t => t.end).filter(e => e === undefined).length > 0;
  if (isThereAnyUnclosedTag) throw new Error("! @ !")
}

const parseTag = (
  tag: UnparsedTag,
  param: {
    markups: Markup[];
    embeds: Embed[]
  }, configuration: Configuration) => {
  const properties = parsePropertiesFromTag(tag);

  const type = properties["data-type"]
  if (!type) throw new Error("Data type must be present in a tag")

  if (type.startsWith("debug")) {
    console.warn("Found a debug tag, skipping parsing")
    return
  }

  const elementType = properties["data-element-type"]
  if (!elementType) throw new Error("Data element type must be present in a tag")

  switch (elementType) {
    case "embed":
      param.embeds.push(parseEmbed(properties, tag, configuration, type));
      break;
    case "markup":
      param.markups.push(parseMarkup(properties, configuration, type, tag, param));
      break;
    default:
      throw new Error("Unknown element type")
  }
}

function parseEmbed(properties: Record<string, string>, tag: UnparsedTag, configuration: Configuration, type: string) {
  const dataId = properties["data-id"]
  if (!dataId) {
    throw new Error("Data ID must be present in an embed")
  }
  if (tag.start !== tag.end) throw new Error("Embed should always be at point")

  Object.keys(properties).filter(key => key.startsWith("data")).forEach(key => delete properties[key])

  const procproperties = configuration.embedHandlerRegistry.get(type)?.parse(properties) ?? properties

  return ({
    id: dataId,
    type,
    position: tag.start,
    ...(Object.keys(properties).length > 0 ? {properties: procproperties} : {})
  })
}

function parseMarkup(properties: Record<string, string>, configuration: Configuration, type: string, tag: UnparsedTag, param: {
  markups: Markup[];
  embeds: Embed[]
}) {
  Object.keys(properties).filter(key => key.startsWith("data") || key === "class").forEach(key => delete properties[key])
  const _properties = configuration.markupHandlerRegistry.get(type)?.processProperties?.(properties) ?? properties

  if (!tag.end) {
    throw new Error("!#!#$@$$$")
  }

  return ({
    type,
    start: tag.start,
    end: tag.end,
    ...(Object.keys(_properties).length > 0 ? {properties: _properties} : {})
  })
}

const tagName = (e: string) => {
  return /^(\w+)(?=\s+.*$|$)/.exec(e)?.[1];
}

const parsePropertiesFromTag = (tag: UnparsedTag): Record<string, string> => {
  if (!tag.end) throw new Error("Unparsed tag is unclosed, cannot get properties")

  // This should not happen, as DOM should never parse <> or similar as a tag
  if (!tag.tag) throw new Error("Tag name not found")

  const textWithoutATagIdentifier = tag.text.substring(tag.tag.length, tag.text.length)

  return [...textWithoutATagIdentifier.matchAll(htmlAttribute)]
    .map(attributeMatchToEntry)
    .reduce((acc, val) => {
      acc[val.key] = val.value
      return acc
    }, {} as Record<string, string>)
}

const htmlAttribute = /([\w-]+)="(.+?(?<!\\))"/g;

const attributeMatchToEntry = (match: RegExpMatchArray) => ({
  key: match[1],
  value: match[2]
});
