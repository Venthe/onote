import {Document} from "./types";
import * as uuid from "uuid";
import * as VisualEditorDocument from "./document";

it("document", () => {
    const originalModel: Document = {
        type: "document",
        id: uuid.v4().toString(),
        elements: [
            {
                type: "paragraph",
                id: uuid.v4().toString(),
                elements: [
                    {
                        content: "The hobbit was a very well-to-do-hobbit, and his name was baggins",
                        id: uuid.v4().toString(),
                        markups: [
                            {
                                type: "link",
                                start: 4,
                                end: 10,
                                properties: {
                                    url: "http://en.wikipedia.org/wiki/The_Hobbit"
                                }
                            },
                            {
                                type: "bold",
                                start: 58,
                                end: 63
                            },
                            {
                                type: "italic",
                                start: 59,
                                end: 65
                            }
                        ]
                    },
                    {
                        content: "The image:  ",
                        id: uuid.v4().toString(),
                        embeds: [
                            {
                                type: "image",
                                id: "1",
                                position: 11,
                                properties: {
                                    source: "https://picsum.photos/200/300"
                                }
                            },
                            {
                                type: "image",
                                id: "2",
                                position: 12,
                                properties: {
                                    source: "https://picsum.photos/200/300"
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    };

    const doc = new VisualEditorDocument.Document(JSON.parse(JSON.stringify(originalModel)));

    const eject = doc.parse(doc.toDOM()).eject();
    expect(eject).toEqual(originalModel)
})
