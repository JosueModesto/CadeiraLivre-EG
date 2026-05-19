import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { Barbearia } from "./Barbearia";

@Entity("barbearia_funcionamento")
@Unique(["barbearia_id", "dia_semana"])
export class BarbeariaFuncionamento {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int", nullable: false })
  barbearia_id!: number;

  @ManyToOne(() => Barbearia, (barbearia) => barbearia.funcionamento, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "barbearia_id" })
  barbearia!: Barbearia;

  @Column({ type: "int", nullable: false })
  dia_semana!: number;

  @Column({ type: "time", nullable: true })
  hora_abertura?: string;

  @Column({ type: "time", nullable: true })
  hora_fechamento?: string;

  @Column({ type: "boolean", nullable: false, default: true })
  esta_aberto!: boolean;
}