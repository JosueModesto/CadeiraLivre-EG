import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  JoinColumn
} from "typeorm";
import { Usuario } from "./Usuario";

@Entity("barbeiro")
export class Barbeiro {
  @PrimaryColumn()
  id!: number;

  @Column({ type: "varchar", length: 11, unique: true, nullable: true })
  celular?: string;

  @Column({ type: "text", nullable: true })
  descricao?: string;


  //Relacionamento 1:1 com Usuario
  @OneToOne(() => Usuario, usuario => usuario.barbeiro, { onDelete: "CASCADE" })
  @JoinColumn({ name: "id" })
  usuario?: Usuario;
}