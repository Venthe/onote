import { Toolbar, MenuList, MenuItem, ToolbarDivider, Combobox, Option } from "@fluentui/react-components";
import { RibbonMultilist } from "../../../editor/ribbon/elements/RIbbonMultilist";
import { RibbonButton } from "../../../editor/ribbon/elements/RibbonButton";
import { RibbonLargeButton } from "../../../editor/ribbon/elements/RibbonLargeButton";
import { RibbonLargeSplitButton } from "../../../editor/ribbon/elements/RibbonLargeSplitButton";
import { RibbonSplitButton } from "../../../editor/ribbon/elements/RibbonSplitButton";
import { RibbonTabGroup } from "../../../editor/ribbon/elements/RibbonTabGroup";
import { RibbonTabPartition } from "../../../editor/ribbon/elements/RibbonTabPartition";
import { RibbonToggleButton } from "../../../editor/ribbon/elements/RibbonToggleButton";
import { RibbonToolbarDivider } from "../../../editor/ribbon/elements/RibbonToolbarDivider";
import { Clipboard20Filled, Cut20Filled, Copy20Filled, FormatPainter20Filled, BulletList20Filled, NumberedList20Filled, TextIndentDecrease20Filled, TextIndentIncrease20Filled, ClearFormatting20Filled, Bold20Filled, Italics20Filled, Underline20Filled, Strikethrough20Filled, Subscript20Filled, Superscript20Filled, TextHighlight20Filled, TextColour20Filled, TextAlignLeft20Filled, TextDelete20Filled, List20Filled, FindTags20Filled } from "../../../editor/ribbon/elements/icons";
import { RibbonElementToolbar } from "../../../editor/ribbon/ribbon";
import React, { useRef } from "react";
import { toCommonRibbonElement } from "../../plugin";
import { CommonRibbonElementProps } from "../../../editor/ribbon/elements/types";
import "./home.scss"

export const HomeToolbar: RibbonElementToolbar = (props) => {
  const commonRibbonElements = toCommonRibbonElement(props)
  
  return (
    <Toolbar>
      <RibbonTabPartition {...commonRibbonElements} translationKey="ribbon.home.clipboard.partition">
        <RibbonTabGroup debug={commonRibbonElements.debug} height={3} width={2} container={true} direction='column'>
          <RibbonLargeSplitButton {...commonRibbonElements} commandKey="home.clipboard.paste" translationKey="ribbon.home.clipboard.action.paste" icon={<Clipboard20Filled />}>
            <MenuList>
              <MenuItem>[Paste]</MenuItem>
              <MenuItem>[Keep source formatting]</MenuItem>
              <MenuItem>[Merge formatting]</MenuItem>
              <MenuItem>[Keep text only]</MenuItem>
              <MenuItem>[Picture]</MenuItem>
              <MenuItem>[Ink]</MenuItem>
            </MenuList>
          </RibbonLargeSplitButton>
        </RibbonTabGroup>
        <RibbonTabGroup debug={commonRibbonElements.debug} height={3} width={5} container={true} direction='column'>
          <RibbonButton {...commonRibbonElements} label={true} commandKey="home.clipboard.cut" translationKey="ribbon.home.clipboard.action.cut" icon={<Cut20Filled />} />
          <RibbonButton {...commonRibbonElements} label={true} commandKey="home.clipboard.copy" translationKey="ribbon.home.clipboard.action.copy" icon={<Copy20Filled />} />
          <RibbonButton {...commonRibbonElements} label={true} commandKey="home.clipboard.formatPainter" translationKey="ribbon.home.clipboard.action.formatPainter" icon={<FormatPainter20Filled />} />
        </RibbonTabGroup>
      </RibbonTabPartition>
      <ToolbarDivider />
      <RibbonTabPartition {...commonRibbonElements} translationKey="ribbon.home.basicText.partition">
        <RibbonTabGroup height={3} width={9} debug={commonRibbonElements.debug} container={true} direction='column'>
          <RibbonTabGroup debug={commonRibbonElements.debug} height={1}>
            <Toolbar>
              <FontSelector {...commonRibbonElements} commandKey="home.basicText.setFont" translationKey="ribbon.home.basicText.setFont" />
              <RibbonSplitButton {...commonRibbonElements} commandKey="home.basicText.bullets" icon={<BulletList20Filled />}>
                <MenuList>
                  <MenuItem>[Bullet library]</MenuItem>
                </MenuList>
              </RibbonSplitButton>
              <RibbonSplitButton {...commonRibbonElements} commandKey="home.basicText.numbering" icon={<NumberedList20Filled />}>
                <MenuList>
                  <MenuItem>[Numbering library]</MenuItem>
                  <MenuItem>[Customize numbers]</MenuItem>
                </MenuList>
              </RibbonSplitButton>
              <RibbonToolbarDivider />
              <RibbonButton {...commonRibbonElements} commandKey="home.basicText.indent.decrease" translationKey="ribbon.home.basicText.action.indent.decrease" icon={<TextIndentDecrease20Filled />}/>
              <RibbonButton {...commonRibbonElements} commandKey="home.basicText.indent.increase" translationKey="ribbon.home.basicText.action.indent.increase" icon={<TextIndentIncrease20Filled />}/>
              <RibbonToolbarDivider />
              <RibbonButton {...commonRibbonElements} commandKey="home.basicText.clearFormatting" translationKey="ribbon.home.basicText.action.clearFormatting" icon={<ClearFormatting20Filled />}/>
            </Toolbar>
          </RibbonTabGroup>
          <RibbonTabGroup debug={commonRibbonElements.debug} height={1}>
            <Toolbar>
              <RibbonToggleButton {...commonRibbonElements} commandKey="home.basicText.bold" translationKey="ribbon.home.basicText.action.bold" icon={<Bold20Filled />}/>
              <RibbonToggleButton {...commonRibbonElements} commandKey="home.basicText.italic" translationKey="ribbon.home.basicText.action.italic" icon={<Italics20Filled />}/>
              <RibbonToggleButton {...commonRibbonElements} commandKey="home.basicText.underline" translationKey="ribbon.home.basicText.action.underline" icon={<Underline20Filled />}/>
              <RibbonToggleButton {...commonRibbonElements} commandKey="home.basicText.strikethrough" translationKey="ribbon.home.basicText.action.strikethrough" icon={<Strikethrough20Filled />}/>
              <RibbonSplitButton {...commonRibbonElements} commandKey="home.basicText.subscript" icon={<Subscript20Filled />}>
                <MenuList>
                  <MenuItem><Subscript20Filled /> Subscript</MenuItem>
                  <MenuItem><Superscript20Filled /> Superscript</MenuItem>
                </MenuList>
              </RibbonSplitButton>
              <RibbonToolbarDivider />
              <RibbonSplitButton {...commonRibbonElements} commandKey="home.basicText.highlight" icon={<TextHighlight20Filled />}>
                <MenuList>
                  <MenuItem>[Color grid]</MenuItem>
                </MenuList>
              </RibbonSplitButton>
              <RibbonSplitButton {...commonRibbonElements} commandKey="home.basicText.colour" icon={<TextColour20Filled />}>
                <MenuList>
                  <MenuItem>[Theme colors]</MenuItem>
                  <MenuItem>[shades]</MenuItem>
                  <MenuItem>[Standard colors]</MenuItem>
                </MenuList>
              </RibbonSplitButton>
              <RibbonToolbarDivider />
              <RibbonSplitButton {...commonRibbonElements} commandKey="home.basicText.align.left" icon={<TextAlignLeft20Filled />}>
                <MenuList>
                  <MenuItem>[Align left]</MenuItem>
                  <MenuItem>[Center]</MenuItem>
                  <MenuItem>[Align right]</MenuItem>
                  <MenuItem>[Divider]</MenuItem>
                  <MenuItem>[Paragraph spacing]</MenuItem>
                </MenuList>
              </RibbonSplitButton>
              <RibbonToolbarDivider />
              <RibbonButton {...commonRibbonElements} commandKey="home.basicText.delete" translationKey="ribbon.home.basicText.action.delete" icon={<TextDelete20Filled />}/>
            </Toolbar>
          </RibbonTabGroup>
        </RibbonTabGroup>
      </RibbonTabPartition>
      <ToolbarDivider />
      <RibbonTabPartition {...commonRibbonElements} translationKey="ribbon.home.styles.partition">
        <RibbonTabGroup height={3} width={3} debug={commonRibbonElements.debug} container={true}>
          <RibbonMultilist></RibbonMultilist>
        </RibbonTabGroup>
      </RibbonTabPartition>
      <ToolbarDivider />
      <RibbonTabPartition {...commonRibbonElements} translationKey="ribbon.home.tags.partition">
        <RibbonTabGroup height={3} width={12} debug={commonRibbonElements.debug} container={true}>
          <RibbonMultilist></RibbonMultilist>
          <RibbonLargeButton {...commonRibbonElements} icon={<List20Filled />} commandKey="home.tags.flag.todo" translationKey="ribbon.home.styles.action.flag.todo"></RibbonLargeButton>
          <RibbonLargeButton {...commonRibbonElements} icon={<FindTags20Filled />} commandKey="home.tags.flag.find" translationKey="ribbon.home.styles.action.flag.find"></RibbonLargeButton>
          <RibbonLargeSplitButton {...commonRibbonElements} commandKey="home.tags.flag.outlookTag" translationKey="ribbon.home.styles.action.flag.outlookTag">
            <MenuList>
              <MenuItem>[Today]</MenuItem>
              <MenuItem>[Tomorrow]</MenuItem>
              <MenuItem>[This week]</MenuItem>
              <MenuItem>[Next week]</MenuItem>
              <MenuItem>[No date]</MenuItem>
              <MenuItem>[Custom]</MenuItem>
              <MenuItem>[Delete outlook task]</MenuItem>
              <MenuItem>[Open task in outlook]</MenuItem>
            </MenuList>
          </RibbonLargeSplitButton>
        </RibbonTabGroup>
      </RibbonTabPartition>
      <ToolbarDivider />
      <RibbonTabPartition {...commonRibbonElements} translationKey="Email">
        <RibbonTabGroup height={3} width={2} debug={commonRibbonElements.debug} container={true}></RibbonTabGroup>
      </RibbonTabPartition>
      <ToolbarDivider />
      <RibbonTabPartition {...commonRibbonElements} translationKey="Meetings">
        <RibbonTabGroup height={3} width={2} debug={commonRibbonElements.debug} container={true}></RibbonTabGroup>
      </RibbonTabPartition>
      <ToolbarDivider />
      <RibbonTabPartition {...commonRibbonElements} translationKey="Voice">
        <RibbonTabGroup height={3} width={4} debug={commonRibbonElements.debug} container={true}></RibbonTabGroup>
      </RibbonTabPartition>
    </Toolbar >
  );
}

type FontSelectorProps = {
  commandKey: string;
  translationKey?: string;
} & CommonRibbonElementProps;

// TODO: Allow custom styles?
// TODO: Allow write-in
// TODO: Auto-load fonts and sizes? Make it user-expandable?
const FontSelector = (props: FontSelectorProps) => {
  const fontFaceOptions = [
    "Calibri",
    "Whatever"
  ];
  const fontSizeOptions = [
    "15",
    "16"
  ];

  const currentValue = useRef({ face: fontFaceOptions[0], size: fontSizeOptions[0] })
  const execute = () => props.actionCallback(props.commandKey, currentValue.current)

  return (
    <>
      <Combobox
        size="small"
        className="font-selector__face"
        defaultSelectedOptions={[currentValue.current.face]}
        defaultValue={currentValue.current.face}
        onOptionSelect={(ev, data) => { currentValue.current.face = data.optionValue ?? ""; execute(); }}      >
        {fontFaceOptions.map((option) => (
          <Option key={option}>
            {option}
          </Option>
        ))}
      </Combobox>
      <Combobox
        size="small"
        className="font-selector__size"
        defaultSelectedOptions={[currentValue.current.size]}
        defaultValue={currentValue.current.size}
        onOptionSelect={(ev, data) => { currentValue.current.size = data.optionValue ?? ""; execute(); }}      >
        {fontSizeOptions.map((option) => (
          <Option key={option}>
            {option}
          </Option>
        ))}
      </Combobox>
    </>
  )
}
