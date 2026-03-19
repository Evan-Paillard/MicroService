"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const offer_1 = require("../models/offer");
const router = (0, express_1.Router)();
router.post('/', async (req, res, next) => {
    try {
        const offer = new offer_1.Offer(req.body);
        await offer.save();
        res.status(201).json(offer);
    }
    catch (err) {
        next(err);
    }
});
router.get('/', async (req, res, next) => {
    try {
        const { domain, city } = req.query;
        const filter = { available: true };
        if (domain)
            filter.domain = domain;
        if (city)
            filter.city = city;
        const offers = await offer_1.Offer.find(filter);
        res.json(offers);
    }
    catch (err) {
        next(err);
    }
});
router.get('/:id', async (req, res, next) => {
    try {
        const offer = await offer_1.Offer.findById(req.params.id);
        if (!offer || !offer.available) {
            return res.status(404).json({ error: 'Offer not found' });
        }
        res.json(offer);
    }
    catch (err) {
        next(err);
    }
});
router.put('/:id', async (req, res, next) => {
    try {
        const offer = await offer_1.Offer.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!offer) {
            return res.status(404).json({ error: 'Offer not found' });
        }
        res.json(offer);
    }
    catch (err) {
        next(err);
    }
});
router.delete('/:id', async (req, res, next) => {
    try {
        const offer = await offer_1.Offer.findByIdAndDelete(req.params.id);
        if (!offer) {
            return res.status(404).json({ error: 'Offer not found' });
        }
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
