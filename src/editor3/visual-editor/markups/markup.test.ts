import {MarkupHandlerRegistry} from "./markup";

describe("markup", () => {

    let registry: MarkupHandlerRegistry | undefined = undefined

    beforeAll(() => {
        registry = MarkupHandlerRegistry.DEFAULT_REGISTRY
    })

    it.each([
        ["bold", `<strong class="text markup strong" data-element-type="markup" data-type="bold">%s</strong>`, undefined],
        ["strikethrough", `<span class="text markup strikethrough" data-element-type="markup" data-type="strikethrough">%s</span>`, undefined],
        ["highlight", `<span class="text markup highlight" data-background-color="#ff0000" data-element-type="markup" data-type="highlight" style="background-color: #ff0000">%s</span>`, {backgroundColor: "#ff0000"}],
        ["highlight", `<span class="text markup highlight" data-background-color="#ffff00" data-element-type="markup" data-type="highlight" style="background-color: #ffff00">%s</span>`, undefined],
        ["italic", `<em class="text markup emphasis" data-element-type="markup" data-type="italic">%s</em>`, undefined],
        ["link", `<a class="text markup link" data-element-type="markup" data-type="link" href="https://example">%s</a>`, {url: "https://example"}],
        ["monospace", `<span class="text markup monospace" data-element-type="markup" data-type="monospace">%s</span>`, undefined],
        ["small-caps", `<span class="text markup small-caps" data-element-type="markup" data-type="small-caps">%s</span>`, undefined],
        ["subscript", `<span class="text markup subscript" data-element-type="markup" data-type="subscript">%s</span>`, undefined],
        ["superscript", `<span class="text markup superscript" data-element-type="markup" data-type="superscript">%s</span>`, undefined],
        ["underline", `<span class="text markup underline" data-element-type="markup" data-type="underline">%s</span>`, undefined],
        ["font", `<span class="text markup font" data-color="#000000" data-element-type="markup" data-type="font" style="color: #000000">%s</span>`, {color: "#000000"}],
        ["font", `<span class="text markup font" data-element-type="markup" data-type="font">%s</span>`, undefined],
    ])("[%s] markup: %s", (type: string, expected: string, properties?: Record<string, string>) => {

        const text = "example"
        const {start: startRenderer, end: endRenderer} = registry?.get(type)?.render(properties) ?? {};
        const l = startRenderer?.(text);
        const r = endRenderer?.(l ?? "");
        const result = expected.replace("%s", text);
        expect(r).toBe(result)
    })
})
