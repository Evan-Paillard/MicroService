"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisNewsRepository = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const uuid_1 = require("uuid");
const scoring_1 = require("../scoring");
const BASE_SCORE = 1000;
class RedisNewsRepository {
    constructor(redisUrl) {
        this.redis = new ioredis_1.default(redisUrl);
    }
    async getLatestNews(limit) {
        const ids = await this.redis.zrevrange('news:timeline', 0, limit - 1);
        if (ids.length === 0)
            return [];
        const items = await this.redis.mget(ids.map(id => `news:${id}`));
        return items.filter(Boolean).map(item => JSON.parse(item));
    }
    async getLatestNewsInCity(city, limit) {
        const ids = await this.redis.zrevrange(`news:city:${city.toLowerCase()}`, 0, limit - 1);
        if (ids.length === 0)
            return [];
        const items = await this.redis.mget(ids.map(id => `news:${id}`));
        return items.filter(Boolean).map(item => JSON.parse(item));
    }
    async createNews(newsData) {
        const news = { ...newsData, id: (0, uuid_1.v4)() };
        const timestamp = new Date(news.date).getTime() || Date.now();
        await this.redis.set(`news:${news.id}`, JSON.stringify(news));
        await this.redis.zadd('news:timeline', timestamp, news.id);
        await this.redis.zadd(`news:city:${news.city.toLowerCase()}`, timestamp, news.id);
        await this.applyScoreDelta(news.city, news.country, (0, scoring_1.computeScoreDelta)(news.tags));
        return news;
    }
    async getCityScore(city) {
        const data = await this.redis.hgetall(`city:${city.toLowerCase()}`);
        if (!data || Object.keys(data).length === 0)
            return null;
        return {
            city: data.city || city,
            country: data.country || '',
            qualityOfLife: parseInt(data.quality_of_life || String(BASE_SCORE)),
            safety: parseInt(data.safety || String(BASE_SCORE)),
            economy: parseInt(data.economy || String(BASE_SCORE)),
            culture: parseInt(data.culture || String(BASE_SCORE)),
            lastUpdated: data.last_updated || new Date().toISOString(),
        };
    }
    async getTopCities(limit) {
        const cityKeys = await this.redis.zrange('cities:ranking', 0, limit - 1);
        const scores = await Promise.all(cityKeys.map(city => this.getCityScore(city)));
        return scores.filter(Boolean);
    }
    async applyScoreDelta(city, country, delta) {
        const key = `city:${city.toLowerCase()}`;
        const existing = await this.redis.hgetall(key);
        const current = {
            qualityOfLife: parseInt(existing.quality_of_life ?? String(BASE_SCORE)),
            safety: parseInt(existing.safety ?? String(BASE_SCORE)),
            economy: parseInt(existing.economy ?? String(BASE_SCORE)),
            culture: parseInt(existing.culture ?? String(BASE_SCORE)),
        };
        const updated = {
            city,
            country: existing.country || country,
            quality_of_life: Math.max(0, current.qualityOfLife + delta.qualityOfLife),
            safety: Math.max(0, current.safety + delta.safety),
            economy: Math.max(0, current.economy + delta.economy),
            culture: Math.max(0, current.culture + delta.culture),
            last_updated: new Date().toISOString(),
        };
        await this.redis.hmset(key, updated);
        const total = updated.quality_of_life + updated.safety + updated.economy + updated.culture;
        await this.redis.zadd('cities:ranking', total, city.toLowerCase());
    }
}
exports.RedisNewsRepository = RedisNewsRepository;
