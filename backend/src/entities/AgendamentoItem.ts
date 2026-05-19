import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Agendamento } from "./Agendamento";
import { BarbeariaServico } from "./BarbeariaServico";

@Entity("agendamento_itens")
export class AgendamentoItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int", nullable: false })
  agendamento_id!: number;

  @ManyToOne(() => Agendamento, (agendamento) => agendamento.itens, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "agendamento_id" })
  agendamento!: Agendamento;

  @Column({ type: "int", nullable: false })
  servico_id!: number;

  @ManyToOne(() => BarbeariaServico, (servico) => servico.itens, {
    nullable: false,
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "servico_id" })
  servico!: BarbeariaServico;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
  preco_cobrado!: string;
}