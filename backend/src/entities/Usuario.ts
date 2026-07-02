import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Agendamento } from "./Agendamento";
import { Barbearia } from "./Barbearia";
import { Cidade } from "./Cidade";

export enum TipoUsuario {
  CLIENTE = "cliente",
  BARBEARIA = "barbearia",
  ADMINISTRADOR = "administrador",
}

@Entity("usuarios")
export class Usuario {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 100, nullable: false })
  nome!: string;

  @Column({ type: "varchar", length: 150, unique: true, nullable: false })
  email!: string;

  @Column({ type: "varchar", length: 255, nullable: false, select: false })
  senha!: string;

  @Column({ type: "varchar", length: 20, nullable: false })
  telefone!: string;

  @Column({ type: "enum", enum: TipoUsuario, nullable: false })
  tipo_usuario!: TipoUsuario;

  @Column({ type: "int", nullable: true })
  cidade_id?: number | null;

  @ManyToOne(() => Cidade, (cidade) => cidade.usuarios, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "cidade_id" })
  cidade?: Cidade | null;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  criado_em!: Date;

  @OneToOne(() => Barbearia, (barbearia) => barbearia.usuario)
  barbearia?: Barbearia;

  @OneToMany(() => Agendamento, (agendamento) => agendamento.cliente)
  agendamentos?: Agendamento[];
}