import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
export const db = new pg.Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PW,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
})