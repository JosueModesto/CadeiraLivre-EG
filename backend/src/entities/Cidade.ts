import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Barbearia } from "./Barbearia";
import { Usuario } from "./Usuario";

@Entity("cidade")
export class Cidade {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 100, nullable: false })
  nome!: string;

  @Column({ type: "char", length: 2, nullable: false })
  estado!: string;

  @OneToMany(() => Usuario, (usuario) => usuario.cidade)
  usuarios?: Usuario[];

  @OneToMany(() => Barbearia, (barbearia) => barbearia.cidade)
  barbearias?: Barbearia[];
}