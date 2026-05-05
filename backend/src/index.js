const express = require("express");
const { AppDataSource } = require("./data-source");

const app = express();
const port = Number(process.env.PORT || 3000);

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
  try {
    await AppDataSource.initialize();
    console.log("TypeORM connected to Postgres");

    app.listen(port, () => {
      console.log(`Backend running on port ${port}`);
    });
  } catch (error) {
    console.error("TypeORM initialization failed:", error.message);
    process.exit(1);
  }
}

bootstrap();
