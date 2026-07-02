/* 
  Padrão de projeto Singleton para gerenciar a conexão com o banco de dados.
  O Singleton é um padrão de projeto criacional que permite a você garantir que uma classe tenha apenas uma instância, enquanto provê um ponto de acesso global para essa instância.
  Ref: https://refactoring.guru/pt-br/design-patterns/singleton
*/

import "reflect-metadata";
import "ts-node/register/transpile-only";
import path from "path";
import { fileURLToPath } from "url";
import { DataSource } from "typeorm";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// configuração do TypeORM
const synchronize = process.env.DB_SYNCHRONIZE === "true";
const logging = process.env.DB_LOGGING === "true";
// Singleton para gerenciar a conexão com o banco de dados
export class DatabaseSingleton {
  private static instance: DataSource;

  private constructor() {}
// Método para obter a instância do DataSource
  static getInstance(): DataSource {
    if (!DatabaseSingleton.instance) {
      DatabaseSingleton.instance = new DataSource({
        type: "postgres",
        host: process.env.DB_HOST || "db",
        port: Number(process.env.DB_PORT || 5432),
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        synchronize,
        logging,
        entities: [path.join(__dirname, "..", "entities", "*.ts")],
        migrations: [],
        subscribers: [],
      });
    }

    return DatabaseSingleton.instance;
  }
  // Método para inicializar a conexão com o banco de dados
  static async initialize(): Promise<DataSource> {
    const db = DatabaseSingleton.getInstance();
    if (!db.isInitialized) {
      await db.initialize();
    }
    return db;
  }
}
