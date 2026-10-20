import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import mysql from 'mysql2/promise';

const bin = 'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysql.exe';
const args = ['-h','127.0.0.1','-P','3306','-u','root','-padmin','--batch','--skip-column-names'];
const data = JSON.parse(fs.readFileSync('data/mysql_database.json','utf8'));
const json = JSON.stringify(data).replace(/\\/g,'\\\\').replace(/'/g,"''");
const conn = await mysql.createConnection({ host: '127.0.0.1', port: 3306, user: 'root', password: 'admin' });
await conn.query('CREATE DATABASE IF NOT EXISTS nomnosh_pizza CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
await conn.query('CREATE TABLE IF NOT EXISTS nomnosh_pizza.app_state (id TINYINT PRIMARY KEY, data JSON NOT NULL, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)');
await conn.query('INSERT INTO nomnosh_pizza.app_state (id,data) VALUES (1,?) ON DUPLICATE KEY UPDATE data=VALUES(data)', [JSON.stringify(data)]);
await conn.end();
console.log('Migrated JSON state into MySQL database nomnosh_pizza.');
