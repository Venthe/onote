import { ipcSetup } from "./ipcBridge"

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }

  // FIXME: In development only
  fetch('../../../node_modules/@onote/web-root/dist/manifest.json')
    .then(response => response.json())
    .then(obj => {
      Object.keys(obj).map(key => {
        const value = obj[key]
        if (value.includes("map")) return

        var script = document.createElement('script');
        script.type = 'text/javascript';

        // FIXME: In development only
        script.src = '../../../node_modules/@onote/web-root/dist' + value;
        document.body.appendChild(script);
      })
    })
})

ipcSetup()