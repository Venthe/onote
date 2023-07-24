import { ActionCallback } from "../../../components/context/commandContext";
import { TranslationFunction } from "../../../components/context/translationContext";

export interface CommonRibbonElementProps {
  actionCallback: ActionCallback
  translate: TranslationFunction
  debug: boolean
  isApplicable: (commandKey: string) => boolean
  isEnabled: (commandKey: string) => boolean
}
