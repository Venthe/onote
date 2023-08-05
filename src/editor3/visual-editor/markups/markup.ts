import {LinkMarkupHandler} from "./impl/link";
import {ItalicMarkupHandler} from "./impl/italic";
import {BoldMarkupHandler} from "./impl/bold";
import {UnderlineMarkupHandler} from "./impl/underline";
import {SuperscriptMarkupHandler} from "./impl/superscript";
import {SubscriptMarkupHandler} from "./impl/subscript";
import {StrikethroughMarkupHandler} from "./impl/strikethrough";
import {SmallCapsMarkupHandler} from "./impl/small-caps";
import {MonospaceMarkupHandler} from "./impl/monospace";
import {HighlightMarkupHandler} from "./impl/highlight";
import {FontMarkupHandler} from "./impl/font";
import {DebugSelectionMarkupHandler} from "./impl/debug-selection";

export interface MarkupHandler {
    type: string,
    elementType: "markup",
    render: (properties?: Record<string, string>) => {
        start: (left: string) => string,
        end: (string: string) => string
    },
    processProperties?: (properties?: Record<string, string>) => Record<string, string>
}

export class MarkupHandlerRegistry {
    public static DEFAULT_REGISTRY = new MarkupHandlerRegistry()

    constructor(private readonly handlers: MarkupHandler[] = [
        LinkMarkupHandler,
        ItalicMarkupHandler,
        BoldMarkupHandler,
        UnderlineMarkupHandler,
        SuperscriptMarkupHandler,
        SubscriptMarkupHandler,
        StrikethroughMarkupHandler,
        SmallCapsMarkupHandler,
        MonospaceMarkupHandler,
        HighlightMarkupHandler,
        FontMarkupHandler,
        DebugSelectionMarkupHandler
    ]) {
    }

    public get(type: string): MarkupHandler | undefined {
        return this.handlers.filter(h => h.type === type)[0]
    }
}
