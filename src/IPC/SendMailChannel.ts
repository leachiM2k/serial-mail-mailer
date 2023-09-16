import { IpcChannelInterface } from "./IpcChannelInterface";
import { IpcMainEvent } from 'electron';
import { IpcRequest } from "../shared/IpcRequest";
import nodemailer from "nodemailer";
import { SettingsType } from "../frontend/Settings";

export class SendMailChannel implements IpcChannelInterface {
    getName(): string {
        return 'send-mail';
    }

    handle(event: IpcMainEvent, request: IpcRequest): void {
        if (!request.responseChannel) {
            request.responseChannel = `${this.getName()}_response`;
        }

        const settings = request.params.settings as SettingsType;

        const transporter = nodemailer.createTransport({
            host: settings.smtpServer,
            port: parseInt(settings.smtpPort),
            tls: {
                ciphers: 'SSLv3',
                rejectUnauthorized: false
            },
            debug: true,
            logger: true,
            auth: {
                user: settings.smtpUser,
                pass: settings.smtpPassword
            }
        });

        transporter.sendMail(request.params.message, (error, info) => {
            transporter.close();
            console.log('***** [SendMailChannel:37] ********************** ', {error, info});
            event.sender.send(request.responseChannel, {success: !error});
        });

    }
}
