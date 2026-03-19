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
exports.getLatestNews = getLatestNews;
exports.getLatestNewsInCity = getLatestNewsInCity;
exports.getCityScore = getCityScore;
exports.getTopCities = getTopCities;
const grpc = __importStar(require("@grpc/grpc-js"));
const protoLoader = __importStar(require("@grpc/proto-loader"));
const path_1 = __importDefault(require("path"));
const PROTO_PATH = path_1.default.join(__dirname, '..', '..', 'mi8', 'proto', 'news.proto');
const packageDef = protoLoader.loadSync(PROTO_PATH, { keepCase: false });
const proto = grpc.loadPackageDefinition(packageDef);
const MI8_ADDRESS = process.env.MI8_ADDRESS || 'localhost:50051';
const client = new proto.mi8.NewsService(MI8_ADDRESS, grpc.credentials.createInsecure());
function getLatestNews(limit) {
    return new Promise((resolve, reject) => {
        client.getLatestNews({ limit }, (err, response) => {
            if (err)
                reject(err);
            else
                resolve(response.news);
        });
    });
}
function getLatestNewsInCity(city, limit) {
    return new Promise((resolve, reject) => {
        client.getLatestNewsInCity({ city, limit }, (err, response) => {
            if (err)
                reject(err);
            else
                resolve(response.news);
        });
    });
}
function getCityScore(city) {
    return new Promise((resolve, reject) => {
        client.getCityScore({ city }, (err, response) => {
            if (err)
                reject(err);
            else
                resolve(response.cityScore);
        });
    });
}
function getTopCities(limit) {
    return new Promise((resolve, reject) => {
        client.getTopCities({ limit }, (err, response) => {
            if (err)
                reject(err);
            else
                resolve(response.cities);
        });
    });
}
