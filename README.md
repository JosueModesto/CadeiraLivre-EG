# Aluno: Josué Modesto da Costa
# Ra: 2304376

# Disclaimer 

Foram utilizadas as ferramentas ChatGPT, Gemini e Copilot para auxiliar no desenvolvimento do projeto.
No frontend, essas ferramentas foram utilizadas principalmente para apoiar o desenvolvimento das telas. Por exemplo, quando era necessário aprender a implementar um determinado componente, como um card responsivo na interface, eram solicitados exemplos de implementação, que serviam como base para a adaptação e construção da solução no projeto.
No backend, o uso foi direcionado principalmente para compreender o funcionamento de ferramentas, bibliotecas e técnicas de programação, além de auxiliar na compreensão e correção de erros de lógica e de problemas técnicos encontrados durante o desenvolvimento, como configurações do Docker e do Swagger. Durante a implementação do padrão Singleton, por exemplo, as ferramentas auxiliaram no entendimento de como integrá-lo ao TypeORM para manter uma única conexão global com o banco de dados. Também foram utilizadas para acelerar o desenvolvimento de operações CRUD, especialmente em controllers mais simples.
Outro uso frequente foi a automatização de tarefas repetitivas, como a alteração de todas as chamadas de AppDataSource.getRepository nos controllers para db.getRepository, em função da adoção do padrão Singleton.
As ferramentas também contribuíram para o planejamento e a definição da melhor abordagem para implementar as regras de negócio do projeto, auxiliando na análise de alternativas e na resolução de dúvidas durante o desenvolvimento.
Por fim, também foram utilizadas para revisar, corrigir e padronizar as descrições dos Pull Requests, garantindo maior clareza e consistência na documentação das alterações realizadas.
O seed.js com a população do banco foi feito totalmente pelo ChatGpt
# Cadeira Livre

Sistema web para gestão de barbearia e agendamentos, com perfis de cliente, dono de barbearia e administrador.

## Visão Geral

O projeto permite:

- Cadastro e autenticação de usuários
- Gestão de barbearia, barbeiros e disponibilidade
- Agendamento de serviços por clientes
- Cancelamento de agendamento por cliente e por barbearia
- Gestão administrativa de cidades e catálogo de serviços

## Tecnologias Atuais

### Backend

- Node.js
- TypeScript
- Express
- TypeORM
- PostgreSQL
- JWT para autenticação
- bcryptjs para hash de senha
- Swagger para documentação da API

### Frontend

- React
- Vite
- React Router
- Axios
- Tailwind CSS

### Infraestrutura

- Docker e Docker Compose

## Arquitetura de Banco

O backend usa TypeORM, com conexão única por padrão Singleton.

- Classe de conexão centralizada em src/padrao/singleton.ts
- Repositórios obtidos a partir da instância única de DataSource

## Funcionalidades

### Autenticação e Perfis

- Login com token JWT
- Perfis de usuário:
	- cliente
	- barbearia
	- administrador

### Regras de Acesso

- CRUD de cidades: somente administrador
- Criação de tipos de serviços: somente administrador
- Barbearia pode ajustar preço dos serviços vinculados

### Barbearia

- Cadastro e edição de dados da barbearia
- Cadastro e gestão de barbeiros
- Configuração de funcionamento semanal
- Configuração de disponibilidade por barbeiro
- Visualização da agenda do dia por barbeiro
- Visualização dos 5 próximos agendamentos da barbearia

### Agendamentos

- Cliente cria agendamento por barbearia, barbeiro e horário disponível
- Cliente visualiza seus agendamentos
- Cliente pode cancelar agendamento ativo
- Barbearia pode cancelar agendamento ativo na própria agenda
- Ao cancelar, o horário volta a ficar disponível

### Experiência de Uso

- Fluxo de novo agendamento em duas etapas
- Seleção inicial por cidade e barbearia
- Mensagens de sucesso e erro nas ações principais

## Como Rodar o Projeto

Pré-requisitos:

- Docker
- Docker Compose

Passos:

1. Na raiz do projeto, execute:

```bash
docker compose up --build
```

2. Acesse:

- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Swagger: http://localhost:3001/api-docs
- PostgreSQL: localhost:5433

Observação:

- O seed é executado automaticamente quando DB_RUN_SEED está true no docker-compose.yml.
