import fs from 'node:fs';
import mysql from 'mysql2/promise';

const data = JSON.parse(fs.readFileSync('data/mysql_database.json.backup', 'utf8'));
const connection = await mysql.createConnection({ host: '127.0.0.1', port: 3306, user: 'root', password: 'admin', database: 'nomnosh_pizza' });

for (const [collection, rows] of Object.entries(data)) {
  if (!Array.isArray(rows)) continue;
  const table = `data_${collection.replace(/[^a-zA-Z0-9_]/g, '_')}`;
  await connection.query(`CREATE TABLE IF NOT EXISTS \`${table}\` (row_id BIGINT AUTO_INCREMENT PRIMARY KEY, source_id VARCHAR(191) NULL, tenant_slug VARCHAR(191) NULL, record JSON NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX idx_source_id (source_id), INDEX idx_tenant (tenant_slug)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  await connection.query(`TRUNCATE TABLE \`${table}\``);
  for (const [index, row] of rows.entries()) {
    await connection.query(`INSERT INTO \`${table}\` (source_id, tenant_slug, record) VALUES (?, ?, ?)`, [row?.id != null ? String(row.id) : String(index + 1), row?.tenant_slug || null, JSON.stringify(row)]);
  }
  console.log(`${table}: ${rows.length} rows`);
}
await connection.end();
