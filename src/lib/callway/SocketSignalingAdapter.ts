import type { Socket } from "socket.io-client";
import type {
  SignalingAdapter,
  SignalingHandler,
  SignalingMessage,
} from "callway";

/**
 * Relays Callway SDP/ICE messages over the Nest `/calls` Socket.IO namespace.
 */
export class SocketSignalingAdapter implements SignalingAdapter {
  private socket: Socket;
  private handlerMap = new Map<string, SignalingHandler>();
  private onSignaling: ((message: SignalingMessage) => void) | null = null;

  constructor(socket: Socket) {
    this.socket = socket;
  }

  registerPeer(
    peerId: string,
    handler: SignalingHandler,
    _roomId?: string,
  ): void {
    this.handlerMap.set(peerId, handler);

    if (!this.onSignaling) {
      this.onSignaling = (message: SignalingMessage) => {
        const h = this.handlerMap.get(message.to);
        if (h) void h(message);
      };
      this.socket.on("signaling", this.onSignaling);
    }
  }

  unregisterPeer(peerId: string): void {
    this.handlerMap.delete(peerId);
  }

  async sendMessage(message: SignalingMessage): Promise<void> {
    this.socket.emit("signaling", message);
  }

  cleanup(): void {
    if (this.onSignaling) {
      this.socket.off("signaling", this.onSignaling);
      this.onSignaling = null;
    }
    this.handlerMap.clear();
  }
}
