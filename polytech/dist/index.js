"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("./db"));
const students_1 = __importDefault(require("./routes/students"));
const internships_1 = __importDefault(require("./routes/internships"));
const news_1 = __importDefault(require("./routes/news"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/student', students_1.default);
app.use('/internship', internships_1.default);
app.use('/news', news_1.default);
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});
const PORT = process.env.PORT || 3001;
async function start() {
    await db_1.default.query(`
    CREATE TABLE IF NOT EXISTS students (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      firstname VARCHAR(100) NOT NULL,
      name VARCHAR(100) NOT NULL,
      domain VARCHAR(100) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS internships (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      student_id UUID NOT NULL REFERENCES students(id),
      offer_id VARCHAR(255) NOT NULL,
      status VARCHAR(20) NOT NULL CHECK (status IN ('approved', 'rejected')),
      message TEXT NOT NULL
    );
  `);
    app.listen(PORT, () => {
        console.log(`Polytech running on port ${PORT}`);
    });
}
start().catch(console.error);
