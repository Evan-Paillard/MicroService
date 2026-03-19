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
exports.createGrpcServer = createGrpcServer;
const grpc = __importStar(require("@grpc/grpc-js"));
const protoLoader = __importStar(require("@grpc/proto-loader"));
const path_1 = __importDefault(require("path"));
const PROTO_PATH = path_1.default.join(__dirname, '..', 'proto', 'news.proto');
function toGrpcCityScore(cs) {
    return {
        city: cs.city,
        country: cs.country,
        quality_of_life: cs.qualityOfLife,
        safety: cs.safety,
        economy: cs.economy,
        culture: cs.culture,
        last_updated: cs.lastUpdated,
    };
}
function createGrpcServer(repository) {
    const packageDef = protoLoader.loadSync(PROTO_PATH, { keepCase: false });
    const proto = grpc.loadPackageDefinition(packageDef);
    const server = new grpc.Server();
    server.addService(proto.mi8.NewsService.service, {
        getLatestNews: async (call, callback) => {
            try {
                const news = await repository.getLatestNews(call.request.limit);
                callback(null, { news });
            }
            catch (err) {
                callback(err);
            }
        },
        getLatestNewsInCity: async (call, callback) => {
            try {
                const news = await repository.getLatestNewsInCity(call.request.city, call.request.limit);
                callback(null, { news });
            }
            catch (err) {
                callback(err);
            }
        },
        createNews: async (call, callback) => {
            try {
                const news = await repository.createNews(call.request);
                callback(null, { news });
            }
            catch (err) {
                callback(err);
            }
        },
        getCityScore: async (call, callback) => {
            try {
                const cityScore = await repository.getCityScore(call.request.city);
                if (!cityScore) {
                    callback({ code: grpc.status.NOT_FOUND, message: 'City not found' });
                    return;
                }
                callback(null, { cityScore: toGrpcCityScore(cityScore) });
            }
            catch (err) {
                callback(err);
            }
        },
        getTopCities: async (call, callback) => {
            try {
                const cities = await repository.getTopCities(call.request.limit);
                callback(null, { cities: cities.map(toGrpcCityScore) });
            }
            catch (err) {
                callback(err);
            }
        },
    });
    return server;
}
