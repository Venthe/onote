export interface Messaging {
    send(channel: string, ...args: any[]): void
}