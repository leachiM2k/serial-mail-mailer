export interface IpcRequest {
    responseChannel?: string;

    params?: { [key: string]: any};
}
