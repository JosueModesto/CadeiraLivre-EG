import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	OneToOne,
	PrimaryGeneratedColumn,
} from "typeorm";
import { Agendamento } from "./Agendamento";
import { Barbeiro } from "./Barbeiro";
import { BarbeariaFuncionamento } from "./BarbeariaFuncionamento";
import { BarbeariaServico } from "./BarbeariaServico";
import { Cidade } from "./Cidade";
import { Usuario } from "./Usuario";

@Entity("barbearias")
export class Barbearia {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ type: "int", unique: true, nullable: false })
	usuario_id!: number;

	@OneToOne(() => Usuario, (usuario) => usuario.barbearia, { onDelete: "CASCADE" })
	@JoinColumn({ name: "usuario_id" })
	usuario!: Usuario;

	@Column({ type: "varchar", length: 100, nullable: false })
	nome_comercial!: string;

	@Column({ type: "varchar", length: 20, nullable: true })
	telefone_comercial?: string | null;

	@Column({ type: "varchar", length: 255, nullable: false })
	endereco!: string;

	@Column({ type: "int", nullable: false })
	cidade_id!: number;

	@ManyToOne(() => Cidade, (cidade) => cidade.barbearias, {
		nullable: false,
		onDelete: "RESTRICT",
	})
	@JoinColumn({ name: "cidade_id" })
	cidade!: Cidade;

	@Column({ type: "text", nullable: true })
	descricao?: string;

	@Column({ type: "varchar", length: 255, nullable: true })
	foto_perfil?: string;

	@Column({ type: "int", nullable: false, default: 15 })
	intervalo_base!: number;

	@OneToMany(() => BarbeariaFuncionamento, (funcionamento) => funcionamento.barbearia)
	funcionamento?: BarbeariaFuncionamento[];

	@OneToMany(() => Barbeiro, (barbeiro) => barbeiro.barbearia)
	barbeiros?: Barbeiro[];

	@OneToMany(() => BarbeariaServico, (servico) => servico.barbearia)
	servicos?: BarbeariaServico[];

	@OneToMany(() => Agendamento, (agendamento) => agendamento.barbearia)
	agendamentos?: Agendamento[];
}
