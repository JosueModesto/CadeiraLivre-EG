import { DatabaseSingleton } from "./padrao/singleton";

const AppDataSource = DatabaseSingleton.getInstance();

export { AppDataSource };

