import express, { Router } from "express";
import swaggerUi from "swagger-ui-express";
import cors from "cors";
import { AppDataSource } from "./data-source";
import { runSeed } from "./seed";
import { swaggerDocs } from "./swagger";
import authRoutes from "./routes/auth.routes";
import usuarioRoutes from "./routes/usuario.routes";
import cidadeRoutes from "./routes/cidade.routes";
import barbeiroRoutes from "./routes/barbeiro.routes";
import servicoRoutes from "./routes/servico.routes";
import barbeariaRoutes from "./routes/barbearia.routes";
import agendamentoRoutes from "./routes/agendamento.routes";

const app = express();
const port = Number(process.env.PORT || 3000);
const publicPort = Number(process.env.PUBLIC_PORT || port);
const dbRetryDelayMs = Number(process.env.DB_RETRY_DELAY_MS || 3000);

// Agregar rotas
const apiRoutes = Router();
apiRoutes.use("/auth", authRoutes);
apiRoutes.use("/usuarios", usuarioRoutes);
apiRoutes.use("/cidades", cidadeRoutes);
apiRoutes.use("/barbeiros", barbeiroRoutes);
apiRoutes.use("/servicos", servicoRoutes);
apiRoutes.use("/barbearias", barbeariaRoutes);
apiRoutes.use("/agendamentos", agendamentoRoutes);

// CORS Configuration
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Rotas da API
app.use("/api", apiRoutes);

async function bootstrap() {
  while (!AppDataSource.isInitialized) {
    try {
      await AppDataSource.initialize();
      console.log("✓ TypeORM conectado ao PostgreSQL");
    } catch (error) {
      const err = error as Error;
      console.error(`✗ Erro ao conectar ao banco: ${err.message}`);
      console.log(`  Tentando novamente em ${dbRetryDelayMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, dbRetryDelayMs));
    }
  }

  try {
    await runSeed();
  } catch (error) {
    const err = error as Error;
    console.error(`✗ Erro ao executar seed: ${err.message}`);
  }
  

  app.listen(port, () => {
    console.log(`\n🎉 Backend rodando em http://localhost:${publicPort}`);
    console.log(`📚 Documentação Swagger: http://localhost:${publicPort}/api-docs\n`);
  });
}

bootstrap();
