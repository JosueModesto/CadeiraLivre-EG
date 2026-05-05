require("reflect-metadata");
const { DataSource } = require("typeorm");

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "db",
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: false,
  entities: [],
  migrations: [],
  subscribers: [],
});

module.exports = { AppDataSource };
