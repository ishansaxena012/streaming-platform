"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamerWorkerModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const queue_module_1 = require("./modules/queue/queue.module");
const video_processing_worker_1 = require("./modules/queue/video-processing.worker");
let StreamerWorkerModule = class StreamerWorkerModule {
    constructor(worker) {
        this.worker = worker;
        console.log("StreamerWorkerModule initialized with worker");
    }
};
exports.StreamerWorkerModule = StreamerWorkerModule;
exports.StreamerWorkerModule = StreamerWorkerModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ".env",
            }),
            queue_module_1.QueueModule,
        ],
    }),
    __metadata("design:paramtypes", [video_processing_worker_1.VideoProcessingWorker])
], StreamerWorkerModule);
