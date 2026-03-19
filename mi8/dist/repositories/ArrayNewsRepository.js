"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayNewsRepository = void 0;
const uuid_1 = require("uuid");
const scoring_1 = require("../scoring");
const BASE_SCORE = 1000;
class ArrayNewsRepository {
    constructor() {
        this.news = [
            {
                id: (0, uuid_1.v4)(),
                name: 'Berlin Innovation Hub Opens',
                source: 'Tech Weekly',
                date: new Date('2025-01-10').toISOString(),
                tags: ['innovation'],
                city: 'Berlin',
                country: 'Germany',
            },
            {
                id: (0, uuid_1.v4)(),
                name: 'Paris Cultural Festival 2025',
                source: 'Le Monde',
                date: new Date('2025-01-12').toISOString(),
                tags: ['culture', 'entertainment'],
                city: 'Paris',
                country: 'France',
            },
            {
                id: (0, uuid_1.v4)(),
                name: 'Tokyo Healthcare Breakthrough',
                source: 'Japan Times',
                date: new Date('2025-01-15').toISOString(),
                tags: ['healthcare', 'innovation'],
                city: 'Tokyo',
                country: 'Japan',
            },
        ];
        this.cityScores = new Map();
    }
    async getLatestNews(limit) {
        return [...this.news]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, limit);
    }
    async getLatestNewsInCity(city, limit) {
        return [...this.news]
            .filter(n => n.city.toLowerCase() === city.toLowerCase())
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, limit);
    }
    async createNews(newsData) {
        const news = { ...newsData, id: (0, uuid_1.v4)() };
        this.news.push(news);
        this.applyScoreDelta(news.city, news.country, (0, scoring_1.computeScoreDelta)(news.tags));
        return news;
    }
    async getCityScore(city) {
        return this.cityScores.get(city.toLowerCase()) ?? null;
    }
    async getTopCities(limit) {
        return [...this.cityScores.values()]
            .sort((a, b) => this.total(a) - this.total(b))
            .slice(0, limit);
    }
    total(score) {
        return score.safety + score.economy + score.qualityOfLife + score.culture;
    }
    applyScoreDelta(city, country, delta) {
        const key = city.toLowerCase();
        const current = this.cityScores.get(key) ?? {
            city,
            country,
            qualityOfLife: BASE_SCORE,
            safety: BASE_SCORE,
            economy: BASE_SCORE,
            culture: BASE_SCORE,
            lastUpdated: new Date().toISOString(),
        };
        this.cityScores.set(key, {
            ...current,
            safety: Math.max(0, current.safety + delta.safety),
            economy: Math.max(0, current.economy + delta.economy),
            qualityOfLife: Math.max(0, current.qualityOfLife + delta.qualityOfLife),
            culture: Math.max(0, current.culture + delta.culture),
            lastUpdated: new Date().toISOString(),
        });
    }
}
exports.ArrayNewsRepository = ArrayNewsRepository;
