import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MockRedisService {
  private readonly logger = new Logger(MockRedisService.name);
  private data = new Map<string, { value: string; expiry?: number }>();

  async get(key: string): Promise<string | null> {
    const item = this.data.get(key);
    if (!item) return null;

    if (item.expiry && Date.now() > item.expiry) {
      this.data.delete(key);
      return null;
    }

    return item.value;
  }

  async set(key: string, value: string): Promise<void> {
    this.data.set(key, { value });
  }

  async setex(key: string, ttlSeconds: number, value: string): Promise<void> {
    const expiry = Date.now() + ttlSeconds * 1000;
    this.data.set(key, { value, expiry });
  }

  async del(key: string): Promise<void> {
    this.data.delete(key);
  }

  async ping(): Promise<string> {
    return 'PONG';
  }

  async quit(): Promise<void> {
    this.data.clear();
  }

  async setWithExpiry(key: string, value: string, ttlSeconds: number): Promise<void> {
    await this.setex(key, ttlSeconds, value);
  }

  async getAndDelete(key: string): Promise<string | null> {
    const value = await this.get(key);
    if (value) {
      await this.del(key);
    }
    return value;
  }

  async incrementWithExpiry(key: string, ttlSeconds: number): Promise<number> {
    const current = await this.get(key);
    const newValue = (current ? parseInt(current) : 0) + 1;
    await this.setex(key, ttlSeconds, newValue.toString());
    return newValue;
  }
}
