import { app, safeStorage } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { SettingsType } from "../frontend/Settings";

const PASSWORD_FIELDS: (keyof SettingsType)[] = ['smtpPassword', 'gmailPassword'];

export class SettingsStorage {
    private static get settingsPath(): string {
        return path.join(app.getPath('userData'), 'settings.json');
    }

    static save(settings: SettingsType): void {
        const toStore: Record<string, unknown> = { ...settings };

        for (const field of PASSWORD_FIELDS) {
            const value = settings[field];
            if (value && safeStorage.isEncryptionAvailable()) {
                toStore[field] = safeStorage.encryptString(value).toString('base64');
            }
        }

        fs.writeFileSync(SettingsStorage.settingsPath, JSON.stringify(toStore), 'utf8');
    }

    static load(): SettingsType | undefined {
        const filePath = SettingsStorage.settingsPath;
        if (!fs.existsSync(filePath)) {
            return undefined;
        }

        const raw = fs.readFileSync(filePath, 'utf8');
        const settings = JSON.parse(raw) as SettingsType;

        for (const field of PASSWORD_FIELDS) {
            const encrypted = (settings as Record<string, unknown>)[field];
            if (typeof encrypted === 'string' && safeStorage.isEncryptionAvailable()) {
                try {
                    (settings as Record<string, unknown>)[field] = safeStorage.decryptString(
                        Buffer.from(encrypted, 'base64')
                    );
                } catch {
                    (settings as Record<string, unknown>)[field] = '';
                }
            }
        }

        return settings;
    }
}
