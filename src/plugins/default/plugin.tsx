import { DocumentSupportPlugin } from "../plugin-types";
import { HomeToolbar } from "./toolbar/home";
import { InsertToolbar } from "./toolbar/insert";
import { DrawToolbar } from "./toolbar/draw";
import { HistoryToolbar } from "./toolbar/history";
import { ReviewToolbar } from "./toolbar/review";
import { ViewToolbar } from "./toolbar/view";
import { HelpToolbar } from "./toolbar/help";
import { DefaultRORenderer } from "./renderers/ReadOnlyRenderer";
import { DefaultRWRenderer } from "./renderers/ReadWriteRenderer";

export const DefaultDocumentSupport: DocumentSupportPlugin = {
  renderers: {
    readOnly: [
      { render: DefaultRORenderer }
    ],
    editable: [
      { render: DefaultRWRenderer }
    ]
  },
  toolbarElements: [
    { name: "ribbon.tab.home.name", Toolbar: HomeToolbar },
    { name: "ribbon.tab.insert.name", Toolbar: InsertToolbar },
    { name: "ribbon.tab.draw.name", Toolbar: DrawToolbar },
    { name: "ribbon.tab.history.name", Toolbar: HistoryToolbar },
    { name: "ribbon.tab.review.name", Toolbar: ReviewToolbar },
    { name: "ribbon.tab.view.name", Toolbar: ViewToolbar },
    { name: "ribbon.tab.help.name", Toolbar: HelpToolbar }
  ]
}
