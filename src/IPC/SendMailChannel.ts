import { IpcChannelInterface } from "./IpcChannelInterface";
import { IpcMainEvent } from 'electron';
import { IpcRequest } from "../shared/IpcRequest";
import nodemailer, { Transporter } from "nodemailer";
import { SettingsType } from "../frontend/Settings";
import { MailMessageType } from "../shared/MailMessageType";
import { SettingsStorage } from "./SettingsStorage";

export class SendMailChannel implements IpcChannelInterface {
    private cachedTransporter: Transporter | null = null;
    private cachedSettingsKey: string | null = null;

    getName(): string {
        return 'send-mail';
    }

    handle(event: IpcMainEvent, request: IpcRequest): void {
        if (!request.responseChannel) {
            request.responseChannel = `${this.getName()}_response`;
        }

        const responseChannel = request.responseChannel;
        const message = request.params!.message as MailMessageType;

        try {
            const settings = SettingsStorage.load();
            if (!settings) {
                throw new Error('No settings found. Please configure settings first.');
            }

            const transporter = this.getTransporter(settings);

            transporter.sendMail(message, (error) => {
                if (error) {
                    event.sender.send(responseChannel, {
                        success: false,
                        error: error.message,
                    });
                } else {
                    event.sender.send(responseChannel, { success: true });
                }
            });
        } catch (error) {
            event.sender.send(responseChannel, {
                success: false,
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }

    private getTransporter(settings: SettingsType): Transporter {
        const key = JSON.stringify({
            transport: settings.transport,
            smtpServer: settings.smtpServer,
            smtpPort: settings.smtpPort,
            smtpUser: settings.smtpUser,
            gmailUser: settings.gmailUser,
        });

        if (this.cachedTransporter && this.cachedSettingsKey === key) {
            return this.cachedTransporter;
        }

        if (this.cachedTransporter) {
            this.cachedTransporter.close();
        }

        const transporter = this.buildTransporter(settings.transport, settings);
        if (!transporter) {
            throw new Error(`Unknown transport type: ${settings.transport}`);
        }

        this.cachedTransporter = transporter;
        this.cachedSettingsKey = key;
        return transporter;
    }

    private buildTransporter(transport: "smtp" | "gmail", settings: SettingsType): Transporter | null {
        if (transport === "smtp") {
            return nodemailer.createTransport({
                host: settings.smtpServer,
                port: parseInt(settings.smtpPort),
                tls: {
                    ciphers: 'SSLv3',
                    rejectUnauthorized: true
                },
                auth: {
                    user: settings.smtpUser,
                    pass: settings.smtpPassword
                }
            });
        } else if (transport === "gmail") {
            return nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: settings.gmailUser,
                    pass: settings.gmailPassword
                }
            });
        }
        return null;
    }
}
