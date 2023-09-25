import { BrowserWindow, ipcMain, webContents } from 'electron'
import fs from 'fs'
import path from 'path'

let variable = 0;

export const setup = (window: BrowserWindow) => {
    ipcMain.on("message", (msg, ...params) => {
        console.debug("Main: !", msg, params)
        const dir = path.join(__dirname, "../test");


        const result = fs.readdirSync(dir);
        const result2 = result.map(f => ({r: path.resolve(dir, f), f}))
        .map(({r, f}) => {
            const stat = newFunction(f);
            return {
                dir,
                r,
                f,
                stat: stat,
                isDirectory:stat.isDirectory()
            };
        })

        window.webContents.send("response", {
            variable: variable++,
            fs: result2
        })

        function newFunction(f: string): fs.Stats {
            return fs.statSync(f);
        }
    })
}