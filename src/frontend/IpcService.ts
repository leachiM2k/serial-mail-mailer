import {IpcRenderer} from 'electron';
import { IpcRequest } from "../shared/IpcRequest";

export class IpcService {
    private readonly ipcRenderer: IpcRenderer;

    constructor(ipcRenderer: IpcRenderer) {
        this.ipcRenderer = ipcRenderer;
    }

    public send<T>(channel: string, request: IpcRequest = {}): Promise<T> {
        // If there's no responseChannel let's auto-generate it
        if (!request.responseChannel) {
            request.responseChannel = `${channel}_response_${new Date().getTime()}`
        }

        const ipcRenderer = this.ipcRenderer;
        ipcRenderer.send(channel, request);

        // This method returns a promise which will be resolved when the response has arrived.
        return new Promise(resolve => {
            ipcRenderer.once(request.responseChannel, (event, response) => resolve(response));
        });
    }

}
