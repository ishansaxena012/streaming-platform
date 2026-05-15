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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoProcessingWorker = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
let VideoProcessingWorker = class VideoProcessingWorker {
    constructor() {
        console.log("VideoProcessingWorker provider instantiated");
    }
    async onModuleInit() {
        console.log("VideoProcessingWorker onModuleInit starting...");
        const redisUrl = process.env.REDIS_URL;
        console.log("Using REDIS_URL:", redisUrl ? "FOUND" : "MISSING");
        if (!redisUrl) {
            console.error("REDIS_URL is not defined in process.env");
            return;
        }
        const connection = new ioredis_1.default(redisUrl, {
            maxRetriesPerRequest: null,
        });
        new bullmq_1.Worker("video-processing", async (job) => {
            console.log("Worker processing:", job.name, job.data);
            // FFmpeg pipeline comes here later
        }, {
            connection,
        });
        console.log("BullMQ Video Processing Worker started");
    }
};
exports.VideoProcessingWorker = VideoProcessingWorker;
exports.VideoProcessingWorker = VideoProcessingWorker = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], VideoProcessingWorker);
