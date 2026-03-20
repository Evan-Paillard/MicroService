"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const axios_1 = __importDefault(require("axios"));
const db_1 = __importDefault(require("../db"));
const offers_1 = require("./offers");
const ERASMUMU_URL = process.env.ERASMUMU_URL || 'http://localhost:3002';
const SORT_MAP = {
    safety: 'safety',
    economy: 'economy',
    quality_of_life: 'qualityOfLife',
    culture: 'culture',
};
const router = (0, express_1.Router)();
router.post('/', async (req, res, next) => {
    try {
        const { firstname, name, domain } = req.body;
        if (!firstname || !name || !domain) {
            return res.status(400).json({ error: 'firstname, name and domain are required' });
        }
        const result = await db_1.default.query('INSERT INTO students (firstname, name, domain) VALUES ($1, $2, $3) RETURNING *', [firstname, name, domain]);
        res.status(201).json(result.rows[0]);
    }
    catch (err) {
        next(err);
    }
});
router.get('/', async (req, res, next) => {
    try {
        const { domain } = req.query;
        if (!domain) {
            return res.status(400).json({ error: 'domain query parameter is required' });
        }
        const result = await db_1.default.query('SELECT * FROM students WHERE domain = $1', [domain]);
        res.json(result.rows);
    }
    catch (err) {
        next(err);
    }
});
router.get('/:id/recommended-offers', async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const sortBy = req.query.sort_by;
        const studentResult = await db_1.default.query('SELECT * FROM students WHERE id = $1', [req.params.id]);
        if (studentResult.rows.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }
        const student = studentResult.rows[0];
        let offers;
        try {
            const response = await axios_1.default.get(`${ERASMUMU_URL}/offer?domain=${student.domain}`);
            offers = response.data;
        }
        catch {
            return res.status(502).json({ error: 'Erasmumu service unavailable' });
        }
        let enriched = await (0, offers_1.enrichOffers)(offers);
        if (sortBy && SORT_MAP[sortBy]) {
            const key = SORT_MAP[sortBy];
            enriched = enriched.sort((a, b) => {
                const aScore = a.scores?.[sortBy] ?? a.scores?.[key] ?? 0;
                const bScore = b.scores?.[sortBy] ?? b.scores?.[key] ?? 0;
                return bScore - aScore;
            });
        }
        res.json({ student, offers: enriched.slice(0, limit) });
    }
    catch (err) {
        next(err);
    }
});
router.get('/:id', async (req, res, next) => {
    try {
        const result = await db_1.default.query('SELECT * FROM students WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.json(result.rows[0]);
    }
    catch (err) {
        next(err);
    }
});
router.put('/:id', async (req, res, next) => {
    try {
        const { firstname, name, domain } = req.body;
        const result = await db_1.default.query(`UPDATE students
       SET firstname = COALESCE($1, firstname),
           name      = COALESCE($2, name),
           domain    = COALESCE($3, domain)
       WHERE id = $4
       RETURNING *`, [firstname, name, domain, req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.json(result.rows[0]);
    }
    catch (err) {
        next(err);
    }
});
router.delete('/:id', async (req, res, next) => {
    try {
        const result = await db_1.default.query('DELETE FROM students WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
