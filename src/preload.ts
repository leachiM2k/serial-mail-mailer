// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { IpcService } from "./frontend/IpcService";
import { ipcRenderer, contextBridge } from 'electron';
import { IpcRequest } from "./shared/IpcRequest";

declare global {
    interface Window { IpcService: IpcService; }
}

const ALLOWED_CHANNELS = ['send-mail', 'system-info', 'settings-storage'] as const;
type AllowedChannel = typeof ALLOWED_CHANNELS[number];

const isValidChannel = (channel: string): channel is AllowedChannel =>
    (ALLOWED_CHANNELS as readonly string[]).includes(channel);

const ipcService = new IpcService(ipcRenderer);

contextBridge.exposeInMainWorld('IpcService', {
    send: (channel: string, request?: IpcRequest) => {
        if (!isValidChannel(channel)) {
            throw new Error(`IPC channel "${channel}" is not allowed`);
        }
        return ipcService.send(channel, request);
    }
});
