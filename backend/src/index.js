const express = require("express");
const { AppDataSource } = require("./data-source");
const { runSeed } = require("./seed");

const app = express();
const port = Number(process.env.PORT || 3000);
const dbRetryDelayMs = Number(process.env.DB_RETRY_DELAY_MS || 3000);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "backend" });
});

app.get("/api/ping", async (_req, res) => {
  try {
    const result = await AppDataSource.query("SELECT NOW() AS now");
    res.json({ message: "pong", databaseTime: result[0].now });
  } catch (error) {
    res.status(500).json({ message: "database error", error: error.message });
  }
});

async function bootstrap() {
  while (!AppDataSource.isInitialized) {
    try {
      await AppDataSource.initialize();
      console.log("TypeORM connected to Postgres");
    } catch (error) {
      console.error(`TypeORM initialization failed: ${error.message}`);
      console.log(`Retrying DB connection in ${dbRetryDelayMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, dbRetryDelayMs));
    }
  }

  try {
    await runSeed();
  } catch (error) {
    console.error(`Seed failed: ${error.message}`);
  }

  app.listen(port, () => {
    console.log(`Backend running on port ${port}`);
  });
}

bootstrap();
