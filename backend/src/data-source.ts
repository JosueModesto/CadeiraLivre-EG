import "reflect-metadata";
import "ts-node/register/transpile-only";
import path from "path";
import { fileURLToPath } from "url";
import { DataSource } from "typeorm";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const synchronize = process.env.DB_SYNCHRONIZE === "true";
const logging = process.env.DB_LOGGING === "true";

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "db",
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  synchronize,
  logging,
  entities: [path.join(__dirname, "entities", "*.ts")],
  migrations: [],
  subscribers: [],
});

export { AppDataSource };
