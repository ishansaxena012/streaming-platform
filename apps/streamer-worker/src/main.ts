import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { StreamerWorkerModule } from "./streamer-worker.module";

async function bootstrap() {
  await NestFactory.createApplicationContext(StreamerWorkerModule);
  console.log("Streamer Worker running...");
}

bootstrap();
