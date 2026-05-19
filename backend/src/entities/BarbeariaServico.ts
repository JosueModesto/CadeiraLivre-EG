import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AgendamentoItem } from "./AgendamentoItem";
import { Barbearia } from "./Barbearia";

@Entity("barbearia_servicos")
export class BarbeariaServico {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int", nullable: false })
  barbearia_id!: number;

  @ManyToOne(() => Barbearia, (barbearia) => barbearia.servicos, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "barbearia_id" })
  barbearia!: Barbearia;

  @Column({ type: "varchar", length: 100, nullable: false })
  nome_servico!: string;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
  preco!: string;

  @Column({ type: "int", nullable: false })
  duracao_min!: number;

  @OneToMany(() => AgendamentoItem, (item) => item.servico)
  itens?: AgendamentoItem[];
}