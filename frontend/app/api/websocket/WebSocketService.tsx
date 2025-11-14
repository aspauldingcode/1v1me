import SockJS from "sockjs-client";
import { Client, StompSubscription } from "@stomp/stompjs";

class WebSocketService {
  private static instance: WebSocketService;
  private client: Client;
  private isConnected: boolean = false;

  private constructor() {
    this.client = new Client({
      webSocketFactory: () => new SockJS("/game-websocket"),
      reconnectDelay: 5000, // reconnect automatically after 5s if connection drops
      debug: (str) => console.log("[STOMP]", str),
    });
  }

  // Singleton accessor
  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  // Connect once
  public connect(onConnectCallback: () => void) {
    if (this.isConnected) {
      onConnectCallback();
      return;
    }

    this.client.onConnect = (frame) => {
      console.log("WebSocket connected!");
      this.isConnected = true;
      onConnectCallback();
    };

    this.client.onStompError = (frame) => {
      console.error("Broker reported error: ", frame.headers["message"]);
      console.error("Details: ", frame.body);
    };

    this.client.activate();
  }

  // Subscribe to a destination
  public subscribe(destination: string, callback: (msg: any) => void): StompSubscription | null {
    if (!this.isConnected) {
      console.warn("Cannot subscribe, not connected yet!");
      return null;
    }
    return this.client.subscribe(destination, callback);
  }

  // Send a message
  public send(destination: string, body: any) {
    if (!this.isConnected) {
      console.warn("Cannot send, not connected yet!");
      return;
    }
    this.client.publish({
      destination,
      body: JSON.stringify(body),
    });
  }

  // Optional: disconnect
  public disconnect() {
    if (this.client.connected) {
      this.client.deactivate();
      this.isConnected = false;
    }
  }
}

export default WebSocketService.getInstance();