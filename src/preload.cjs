// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {

  onWebSocketClientConnected: (callback) => ipcRenderer.on  ('webSocketClientConnected', (event, data)    => callback(data)),
  onWSTextMessage:            (callback) => ipcRenderer.on  ('wsTextMessageReceived',    (event, message) => callback(message)),
  onWSBinaryMessage:          (callback) => ipcRenderer.on  ('wsBinaryMessageReceived',  (event, message) => callback(message)),
  onWSClientDisconnected:     (callback) => ipcRenderer.on  ('wsClientDisconnected',     (event, data)    => callback(data)),

  sendWSTextMessage:          (message)  => ipcRenderer.send('send-WSTextMessage',   textMessage),
  sendWSBinaryMessage:        (message)  => ipcRenderer.send('send-WSBinaryMessage', binaryMessage),


  on: (channel, callback) => {
    const validChannels = ['init-params'];
    if (validChannels.includes(channel)) {
        ipcRenderer.on(channel, (event, ...args) => callback(event, ...args));
    }
  }

});
