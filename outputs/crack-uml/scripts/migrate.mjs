import { readFile } from "node:fs/promises";
import pg from "pg";

const { Client } = pg;
const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required to run the Postgres migration.");

const client = new Client({ connectionString: url });
await client.connect();
try {
  const sql = await readFile(new URL("../../../replica/schema.sql", import.meta.url), "utf8");
  await client.query(sql);
  console.log("Crack UML schema applied.");
} finally {
  await client.end();
}
