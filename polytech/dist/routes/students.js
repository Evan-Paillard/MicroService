"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../db"));
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
