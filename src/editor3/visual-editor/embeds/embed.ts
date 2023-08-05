import {Embed} from "../types";
import {ImageEmbedHandler} from "./impl/image";

export interface EmbedHandler {
    type: string
    elementType: "embed"

    render(properties?: Record<string, string>): string;
    parse(properties?: Record<string, string>): Record<string, string>
}

type RegExpWithIndices = (RegExpMatchArray & {
    indices: ([number, number])[]
});

export class EmbedHandlerRegistry {
    public static DEFAULT_REGISTRY = new EmbedHandlerRegistry()

    constructor(private readonly handlers: EmbedHandler[] = [ImageEmbedHandler]) {
    }

    get(type: string): EmbedHandler | undefined {
        return this.handlers.filter(e => e.type === type)[0]
    }
}
