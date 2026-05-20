import { Injectable, OnModuleInit } from '@nestjs/common';

import Redis from 'ioredis';

@Injectable()
export class VideoProgressService implements OnModuleInit {
  private publisher: Redis;

  private subscriber: Redis;

  private listeners = new Map<string, Set<(data: any) => void>>();

  constructor() {
    this.publisher = new Redis(process.env.REDIS_URL!, {
      lazyConnect: true,
      maxRetriesPerRequest: null,
    });

    this.subscriber = new Redis(process.env.REDIS_URL!, {
      lazyConnect: true,
      maxRetriesPerRequest: null,
    });
  }

  async onModuleInit() {
    await this.subscriber.subscribe('video-progress');

    console.log('Subscribed to video-progress channel');

    this.subscriber.on('message', (_, message) => {
      const data = JSON.parse(message);

      const videoListeners = this.listeners.get(data.videoId);

      if (!videoListeners) {
        return;
      }

      for (const listener of videoListeners) {
        listener(data);
      }
    });
  }

  async publish(data: any) {
    await this.publisher.publish('video-progress', JSON.stringify(data));
  }

  subscribe(videoId: string, callback: (data: any) => void) {
    if (!this.listeners.has(videoId)) {
      this.listeners.set(videoId, new Set());
    }

    this.listeners.get(videoId)!.add(callback);

    return () => {
      this.listeners.get(videoId)?.delete(callback);
    };
  }
}
