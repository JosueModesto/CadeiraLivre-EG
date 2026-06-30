import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Barbeiro } from "./Barbeiro";

@Entity("barbeiro_disponibilidade")
export class BarbeiroDisponibilidade {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int", nullable: false })
  barbeiro_id!: number;

  @ManyToOne(() => Barbeiro, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "barbeiro_id" })
  barbeiro!: Barbeiro;

  @Column({ type: "int", nullable: false })
  dia_semana!: number;

  @Column({ type: "time", nullable: true })
  hora_inicio?: string | null;

  @Column({ type: "time", nullable: true })
  hora_fim?: string | null;

  @Column({ type: "boolean", nullable: false, default: true })
  esta_disponivel!: boolean;
}
