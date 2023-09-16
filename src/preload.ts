// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { IpcService } from "./frontend/IpcService";
import { ipcRenderer, contextBridge } from 'electron';
import { IpcRequest } from "./shared/IpcRequest";

declare global {
    interface Window { IpcService: IpcService; }
}

const ipcService = new IpcService(ipcRenderer);

contextBridge.exposeInMainWorld('IpcService', {
    send: (channel: string, request?: IpcRequest) => ipcService.send(channel, request)
});
