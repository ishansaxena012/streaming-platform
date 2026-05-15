"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const streamer_worker_module_1 = require("./streamer-worker.module");
async function bootstrap() {
    await core_1.NestFactory.createApplicationContext(streamer_worker_module_1.StreamerWorkerModule);
    console.log("Streamer Worker running...");
}
bootstrap();
