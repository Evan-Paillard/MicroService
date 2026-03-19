"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const grpc = __importStar(require("@grpc/grpc-js"));
const protoLoader = __importStar(require("@grpc/proto-loader"));
const path_1 = __importDefault(require("path"));
const PROTO_PATH = path_1.default.join(__dirname, '..', '..', 'mi8', 'proto', 'news.proto');
const MI8_ADDRESS = process.env.MI8_ADDRESS || 'localhost:50051';
const packageDef = protoLoader.loadSync(PROTO_PATH, { keepCase: false });
const proto = grpc.loadPackageDefinition(packageDef);
const client = new proto.mi8.NewsService(MI8_ADDRESS, grpc.credentials.createInsecure());
const sampleNews = [
    {
        name: 'Berlin Innovation Hub Opens New Campus',
        source: 'Tech Weekly',
        date: new Date().toISOString(),
        tags: ['innovation'],
        city: 'Berlin',
        country: 'Germany',
    },
    {
        name: 'Paris Cultural Festival Draws Record Crowds',
        source: 'Le Monde',
        date: new Date().toISOString(),
        tags: ['culture', 'entertainment'],
        city: 'Paris',
        country: 'France',
    },
    {
        name: 'Tokyo Healthcare Breakthrough in Cancer Research',
        source: 'Japan Times',
        date: new Date().toISOString(),
        tags: ['healthcare', 'innovation'],
        city: 'Tokyo',
        country: 'Japan',
    },
    {
        name: 'Crime Rate Drops in Berlin City Center',
        source: 'Berlin Daily',
        date: new Date().toISOString(),
        tags: ['crime'],
        city: 'Berlin',
        country: 'Germany',
    },
    {
        name: 'Paris Hosts International Music Festival',
        source: 'France Info',
        date: new Date().toISOString(),
        tags: ['culture', 'entertainment'],
        city: 'Paris',
        country: 'France',
    },
];
function createNews(news) {
    return new Promise((resolve, reject) => {
        client.createNews(news, (err, response) => {
            if (err) {
                reject(err);
                return;
            }
            console.log(`Created news: "${response.news.name}" in ${response.news.city}`);
            resolve();
        });
    });
}
async function main() {
    console.log(`Connecting to MI8 at ${MI8_ADDRESS}...`);
    for (const news of sampleNews) {
        await createNews(news);
    }
    console.log('All news sent to MI8.');
    client.close();
}
main().catch(err => {
    console.error(err);
    process.exit(1);
});
