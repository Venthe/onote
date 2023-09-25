import { contextBridge, ipcRenderer } from "electron";

// FIXME: Restrict IPC
export const ipcSetup = () => {
  // // White-listed channels.
  // const ipc = {
  //   'render': {
  //     // From render to main.
  //     'send': [
  //       'productWindow:load'
  //     ],
  //     // From main to render.
  //     'receive': [],
  //     // From render to main and back again.
  //     'sendReceive': [
  //       "message"
  //     ]
  //   }
  // };

  // Exposed protected methods in the render process.
  contextBridge.exposeInMainWorld(
    // Allowed 'ipcRenderer' methods.
    '__onote',
    {
      messaging: {
        // From render to main.
        send: (channel, args) => {
          // let validChannels = ipc.render.send;
          // if (validChannels.includes(channel)) {
          ipcRenderer.send(channel, args);
          // }
        },
        // From main to render.
        receive: (channel, listener) => {
          // let validChannels = ipc.render.receive;
          // if (validChannels.includes(channel)) {
          // Deliberately strip event as it includes `sender`.
          ipcRenderer.on(channel, (event, ...args) => listener(...args));
          // }
        },
        // From render to main and back again.
        invoke: (channel, args) => {
          // let validChannels = ipc.render.sendReceive;
          // if (validChannels.includes(channel)) {
          return ipcRenderer.invoke(channel, args);
          // }
        }
      }
    }
  );
}