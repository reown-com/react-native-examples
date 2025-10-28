import "@walletconnect/react-native-compat";

import { IPOSClient, POSClient } from "@walletconnect/pos-client";

export interface POSClientConfig {
  projectId: IPOSClient["opts"]["projectId"];
  deviceId: IPOSClient["opts"]["deviceId"];
  metadata: IPOSClient["opts"]["metadata"];
  loggerOptions?: IPOSClient["opts"]["loggerOptions"];
}

class POSClientService {
  private static instance: POSClientService;
  private posClient: IPOSClient | null = null;
  private isInitialized = false;
  private config: POSClientConfig | null = null;
  private listeners: Map<string, ((args: any) => void)[]> = new Map();

  private constructor() {}

  public static getInstance(): POSClientService {
    if (!POSClientService.instance) {
      POSClientService.instance = new POSClientService();
    }
    return POSClientService.instance;
  }

  public async initialize(config: POSClientConfig): Promise<void> {
    if (this.isInitialized && this.posClient) {
      return;
    }

    this.config = config;

    try {
      this.posClient = await POSClient.init({
        projectId: config.projectId,
        metadata: config.metadata,
        deviceId: config.deviceId,
        loggerOptions: config.loggerOptions,
      });

      this.isInitialized = true;
      this.attachListeners();
    } catch (error) {
      console.error("Error initializing POS client:", error);
      throw error;
    }
  }

  public getClient(): IPOSClient | null {
    return this.posClient;
  }

  public getIsInitialized(): boolean {
    return this.isInitialized;
  }

  public addListener(event: string, callback: (args: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);

    if (this.posClient) {
      this.posClient.on(event as any, callback);
    }
  }

  public removeListener(event: string, callback: (args: any) => void): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }

    if (this.posClient) {
      this.posClient.off(event as any, callback);
    }
  }

  private attachListeners(): void {
    if (!this.posClient) return;

    // Re-attach all stored listeners
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach((callback) => {
        this.posClient!.on(event as any, callback);
      });
    });
  }

  public async disconnect(): Promise<void> {
    if (this.posClient) {
      await this.posClient.restart();
      this.posClient = null;
      this.isInitialized = false;
      this.listeners.clear();
    }
  }
}

export default POSClientService;
