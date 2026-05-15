import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { QueueModule } from "./modules/queue/queue.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: "apps/streamer-worker/.env",
    }),
    QueueModule,
  ],
})
export class StreamerWorkerModule {}
