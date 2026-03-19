"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connect = connect;
const mongoose_1 = __importDefault(require("mongoose"));
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/erasmumu';
async function connect() {
    await mongoose_1.default.connect(MONGO_URL);
}
