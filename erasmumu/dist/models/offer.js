"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Offer = void 0;
const mongoose_1 = require("mongoose");
const offerSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    link: { type: String, required: true },
    city: { type: String, required: true },
    domain: { type: String, required: true },
    salary: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    available: { type: Boolean, required: true, default: true },
});
exports.Offer = (0, mongoose_1.model)('Offer', offerSchema);
