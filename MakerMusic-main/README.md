# 🎵 MakerMusic

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![Curso](https://img.shields.io/badge/curso-ADS-blue)
![Plataforma](https://img.shields.io/badge/plataforma-mobile-lightgrey)

---

## 📌 Visão Geral
O **MakerMusic** é uma aplicação **mobile** desenvolvida para **gestão de escolas de música**, permitindo o controle de alunos, professores, aulas, tarefas, frequência, comunicação interna e pagamentos, tudo de forma centralizada e digital.

O projeto foi desenvolvido como parte das atividades acadêmicas do curso de **Análise e Desenvolvimento de Sistemas (ADS)**, com foco em **desenvolvimento mobile, API REST e banco de dados relacional**.

---

## 🎯 Objetivo do Projeto
Facilitar a gestão administrativa e pedagógica de escolas de música, reduzindo controles manuais e oferecendo uma solução moderna, acessível por meio de um aplicativo mobile.

---

## 👥 Público-Alvo
- 🎼 Escolas de música  
- 🎸 Professores  
- 🎹 Alunos  
- 🧑‍💼 Coordenadores / Administradores  

---

## ⚙️ Funcionalidades

### ✅ Funcionalidades implementadas
- Cadastro e gerenciamento de usuários
- Controle de horários (aulas)
- Registro de presença
- Gestão de tarefas e entregas
- Comunicação via chat interno
- Controle financeiro básico (pagamentos)

### 🚧 Funcionalidades planejadas
- Dashboard administrativo
- Relatórios financeiros
- Notificações push
- Controle de permissões por perfil (Administrador, Professor e Aluno)

---

## 🛠 Tecnologias Utilizadas

### 🔙 Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![dotenv](https://img.shields.io/badge/dotenv-ECD53F?style=for-the-badge&logo=dotenv&logoColor=black)

---

### 📱 Frontend (Mobile)
![React Native](https://img.shields.io/badge/React%20Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React Navigation](https://img.shields.io/badge/React%20Navigation-CA4245?style=for-the-badge&logo=react&logoColor=white)

---

### 🗄 Banco de Dados
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)

---

### 🧰 Ferramentas
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)
![npm](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)

---

## 📂 Estrutura do Projeto


---

## 🗄 Banco de Dados

O projeto utiliza **MySQL** como banco de dados relacional.

### 📄 Script SQL
O arquivo `makermusic_db.sql` contém:
- Criação das tabelas
- Relacionamentos
- Dados de exemplo

### ▶️ Como importar o banco
```sql
CREATE DATABASE makermusic;

cp .env.example .env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASS=sua_senha
DB_NAME=makermusic
JWT_SECRET=seu_segredo
EXPO_PUBLIC_API_URL=http://SEU_IP:3000/api
npm install -g expo-cli
cp .env.example .env
EXPO_PUBLIC_API_URL=http://SEU_IP:3000/api
npm install -g expo-cli

cd backend
npm install
npm run dev
http://localhost:3000
cd frontend
npm install
expo start

---

