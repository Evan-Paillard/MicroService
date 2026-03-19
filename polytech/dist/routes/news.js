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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mi8 = __importStar(require("../mi8Client"));
const router = (0, express_1.Router)();
router.get('/', async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const { city } = req.query;
        const news = city
            ? await mi8.getLatestNewsInCity(city, limit)
            : await mi8.getLatestNews(limit);
        res.json(news);
    }
    catch (err) {
        next(err);
    }
});
router.get('/cities/top', async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const cities = await mi8.getTopCities(limit);
        res.json(cities);
    }
    catch (err) {
        next(err);
    }
});
router.get('/city/:city/score', async (req, res, next) => {
    try {
        const score = await mi8.getCityScore(req.params.city);
        res.json(score);
    }
    catch (err) {
        if (err?.code === 5) {
            return res.status(404).json({ error: 'City not found' });
        }
        next(err);
    }
});
exports.default = router;
