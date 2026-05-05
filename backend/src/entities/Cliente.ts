import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  JoinColumn
} from "typeorm";
import { Usuario } from "./Usuario";

@Entity("cliente")
export class Cliente {
  @PrimaryColumn()
  id!: number;

  @Column({ type: "varchar", length: 11, unique: true, nullable: true })
  celular?: string;

  //Relacionamento 1:1 com Usuario
  @OneToOne(() => Usuario, usuario => usuario.cliente, { onDelete: "CASCADE" })
  @JoinColumn({ name: "id" })
  usuario?: Usuario;
}