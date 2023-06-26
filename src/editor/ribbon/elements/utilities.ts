import { TranslationFunction } from "../../../components/context/translationContext";

export const nameWithAriaTranslation = (
  translationKey: string | undefined,
  translate: TranslationFunction
) => {
  const translationKeySanitized = translationKey ?? "unknown";

  const nameKey = translationKeySanitized + ".name"
  const name = translate(nameKey)

  const ariaLabelKey = translationKeySanitized + ".ariaLabel"
  const ariaLabel = translate(ariaLabelKey, undefined)
  const aria = ariaLabel ? { "aria-label": ariaLabel } : {}

  return {name, ariaAttribute: aria}
}
