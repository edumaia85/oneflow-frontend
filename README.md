# Documentação Técnica do Projeto OneFlow Frontend

## Introdução
O **OneFlow** constitui a interface web de um sistema desenvolvido para gestão dos recursos da Empresa Junior OneBit. Utiliza tecnologias modernas como **React + Vite + TypeScript**, estruturadas segundo princípios avançados de engenharia de software, incluindo modularização, reutilização e separação de responsabilidades. O sistema adota uma abordagem orientada a componentes e segue as melhores práticas para desenvolvimento frontend escalável e sustentável.

## Tecnologias Empregadas
- **Framework:** React + Vite
- **Linguagem de Programação:** TypeScript
- **Gerenciamento de Estado:** [useState, Context API]
- **Estilização:** [Tailwind CSS, Shadcn/UI]
- **Comunicação Assíncrona:** [Fetch API]
- **Roteamento:** React Router DOM
- **Ferramenta de Build:** Vite

## Arquitetura e Estrutura do Código
A arquitetura do sistema é concebida para maximizar a escalabilidade, testabilidade e manutenção do código. A estrutura organizacional segue o padrão modularizado:

```
oneflow-frontend/
├── public/         # Recursos públicos como imagens e fontes
├── src/            # Código-fonte principal
│   ├── assets/     # Recursos estáticos específicos do projeto
│   ├── components/ # Componentes modulares e reutilizáveis
│   ├── contexts/   # Provedores globais de contexto
│   ├── hooks/      # Hooks customizados para abstração de lógica
│   ├── layouts/    # Layouts reutilizáveis da aplicação
│   ├── pages/      # Estruturação das rotas e interfaces da aplicação
│   ├── services/   # Camada de integração com APIs
│   ├── utils/      # Bibliotecas auxiliares e funções utilitárias
├── package.json    # Dependências e scripts do projeto
├── tsconfig.json   # Configuração do TypeScript
├── vite.config.ts  # Configuração do Vite
```

## Processo de Instalação e Configuração
1. **Clonar o repositório:**
   ```sh
   git clone [https://github.com/edumaia85/oneflow-frontend.git]
   cd oneflow-frontend
   ```

2. **Instalar as dependências:**
   ```sh
   npm install
   ```

4. **Inicializar o projeto:**
   ```sh
   npm run dev
   ```
   O sistema estará acessível em `http://localhost:5173` (ou conforme configuração específica).

## Diretórios Principais e sua Finalidade
### `components/`
Armazena componentes reutilizáveis, organizados por domínio e responsabilidade dentro da aplicação.

### `hooks/`
Contém hooks customizados para encapsular lógica reutilizável relacionada a estados e efeitos colaterais.

### `pages/`
Cada arquivo neste diretório corresponde a uma página navegável da aplicação e contém a lógica específica da interface correspondente.

### `services/`
Módulos responsáveis pela comunicação com APIs externas e abstração de requisições assíncronas, garantindo separação da lógica de rede do restante da aplicação.

### `utils/`
Conjunto de funções auxiliares, como formatação de dados, manipulação de strings, operações matemáticas e outras funções genéricas utilizadas em múltiplas partes do sistema.

## Padrões e Boas Práticas de Desenvolvimento
- Utilizar **TypeScript** para garantir tipagem segura e melhor documentação do código.
- Nomear arquivos com **snake-case** (exemplo: `my-component.tsx`).
- Centralizar funções auxiliares em `utils/` para evitar duplicação de código.
- Padronizar commits e versionamento seguindo **Conventional Commits**.

## Fluxo de Contribuição e Versionamento
1. **Criar uma nova branch:**
   ```sh
   git checkout -b feature/nova-funcionalidade
   ```
2. **Implementar a funcionalidade e realizar commit:**
   ```sh
   git commit -m "feat: Implementa nova funcionalidade X"
   ```
3. **Subir as alterações para o repositório remoto:**
   ```sh
   git push origin feature/nova-funcionalidade
   ```
4. **Criar um Pull Request para revisão de código.**

## Suporte e Contato
Dúvidas, sugestões ou contribuições podem ser direcionadas para [edumaia909@gmail.com](mailto:edumaia909@gmail.com).

