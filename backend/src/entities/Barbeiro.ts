import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Agendamento } from "./Agendamento";
import { Barbearia } from "./Barbearia";

@Entity("barbeiros")
export class Barbeiro {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int", nullable: false })
  barbearia_id!: number;

  @ManyToOne(() => Barbearia, (barbearia) => barbearia.barbeiros, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "barbearia_id" })
  barbearia!: Barbearia;

  @Column({ type: "varchar", length: 100, nullable: false })
  nome!: string;

  @Column({ type: "boolean", nullable: false, default: true })
  ativo!: boolean;

  @OneToMany(() => Agendamento, (agendamento) => agendamento.barbeiro)
  agendamentos?: Agendamento[];
}