require("reflect-metadata");
require("ts-node/register/transpile-only");
const path = require("path");
const { DataSource } = require("typeorm");

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
  entities: [path.join(__dirname, "entities", "*.{ts,js}")],
  migrations: [],
  subscribers: [],
});

module.exports = { AppDataSource };
