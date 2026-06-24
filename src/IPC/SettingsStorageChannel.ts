import { IpcChannelInterface } from "./IpcChannelInterface";
import { IpcMainEvent } from 'electron';
import { IpcRequest } from "../shared/IpcRequest";
import { SettingsStorage } from "./SettingsStorage";
import { SettingsType } from "../frontend/Settings";

export class SettingsStorageChannel implements IpcChannelInterface {
    getName(): string {
        return 'settings-storage';
    }

    handle(event: IpcMainEvent, request: IpcRequest): void {
        if (!request.responseChannel) {
            request.responseChannel = `${this.getName()}_response`;
        }

        const action = request.params?.action as 'save' | 'load';

        try {
            if (action === 'save') {
                const settings = request.params?.settings as SettingsType;
                SettingsStorage.save(settings);
                event.sender.send(request.responseChannel, { success: true });
            } else {
                const settings = SettingsStorage.load();
                event.sender.send(request.responseChannel, { success: true, settings });
            }
        } catch (error) {
            event.sender.send(request.responseChannel, {
                success: false,
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
}
