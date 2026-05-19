import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Barbeiro } from "./Barbeiro";
import { Barbearia } from "./Barbearia";
import { AgendamentoItem } from "./AgendamentoItem";
import { Usuario } from "./Usuario";

export enum StatusAgendamento {
  AGENDADO = "agendado",
  CONCLUIDO = "concluido",
  CANCELADO = "cancelado",
}

@Entity("agendamentos")
export class Agendamento {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int", nullable: false })
  cliente_id!: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.agendamentos, {
    nullable: false,
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "cliente_id" })
  cliente!: Usuario;

  @Column({ type: "int", nullable: false })
  barbearia_id!: number;

  @ManyToOne(() => Barbearia, (barbearia) => barbearia.agendamentos, {
    nullable: false,
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "barbearia_id" })
  barbearia!: Barbearia;

  @Column({ type: "int", nullable: false })
  barbeiro_id!: number;

  @ManyToOne(() => Barbeiro, (barbeiro) => barbeiro.agendamentos, {
    nullable: false,
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "barbeiro_id" })
  barbeiro!: Barbeiro;

  @Column({ type: "timestamp", nullable: false })
  data_hora_inicio!: Date;

  @Column({ type: "timestamp", nullable: false })
  data_hora_fim!: Date;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
  valor_total!: string;

  @Column({ type: "enum", enum: StatusAgendamento, nullable: false })
  status!: StatusAgendamento;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  criado_em!: Date;

  @OneToMany(() => AgendamentoItem, (item) => item.agendamento)
  itens?: AgendamentoItem[];
}