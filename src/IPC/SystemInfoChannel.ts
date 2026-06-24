import { IpcChannelInterface } from "./IpcChannelInterface";
import { IpcMainEvent } from 'electron';
import { IpcRequest } from "../shared/IpcRequest";
import os from "os";

export class SystemInfoChannel implements IpcChannelInterface {
    getName(): string {
        return 'system-info';
    }

    handle(event: IpcMainEvent, request: IpcRequest): void {
        if (!request.responseChannel) {
            request.responseChannel = `${this.getName()}_response`;
        }
        event.sender.send(request.responseChannel, {
            platform: os.platform(),
            arch: os.arch(),
            hostname: os.hostname(),
            kernel: os.release(),
            uptime: os.uptime(),
        });
    }
}
