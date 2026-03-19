"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("./db");
const offers_1 = __importDefault(require("./routes/offers"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/offer', offers_1.default);
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});
const PORT = process.env.PORT || 3002;
(0, db_1.connect)()
    .then(() => {
    app.listen(PORT, () => {
        console.log(`Erasmumu running on port ${PORT}`);
    });
})
    .catch(console.error);
