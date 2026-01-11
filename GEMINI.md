# ImobiFlow Context & Guidelines

Este arquivo serve como **fonte de verdade** para agentes de IA entenderem o contexto, arquitetura e padrões do projeto ImobiFlow.

---

## 🏢 Visão Geral do Produto
**Nome:** ImobiFlow SaaS
**Objetivo:** Plataforma SaaS B2B para imobiliárias gerenciarem vendas, comissões, financeiro e promoverem competitividade via rankings (Gamification).

### Principais Entidades
- **Tenant (Imobiliária):** Cliente do SaaS. Possui configurações próprias (logo, meta).
- **User (Corretor/Gerente):** Usuário do sistema. Vinculado a um Tenant.
- **Deal (Venda):** Registro de venda de um imóvel.
- **Commission:** Divisão financeira da venda.
- **Property:** Imóvel (pode ser sincronizado via API JetImóveis ou manual).

---

## 🛠️ Stack Tecnológica
- **Framework:** Next.js 14+ (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS + Shadcn/UI
- **Banco de Dados:** PostgreSQL (Neon) - Serverless
- **ORM:** Drizzle ORM
- **Auth:** Auth.js (NextAuth) v5 - Magic Links (Passwordless)
- **Pagamentos:** Stripe
- **Deploy:** Railway 
---

## 🏛️ Arquitetura & Padrões

### 1. Estrutura de Pastas (Sugestão)
- `/src/app/(app)`: Rotas autenticadas do Tenant.
- `/src/app/(auth)`: Rotas de Login/Onboarding.
- `/src/db`: Schemas do Drizzle e Migrations.
- `/src/actions`: Server Actions (substituindo API Routes onde possível).
- `/src/components/ui`: Componentes Shadcn.

### 2. Princípios (Clean Code & UI)
- **Server Actions First:** Preferir Server Actions para mutações de dados.
- **Type Safety:** TypeScript estrito. Zod para validação de esquemas.
- **Multi-tenancy:** Toda query de dados deve filtrar pelo `tenantId` (exceto Super Admin).
- **Shadcn/UI First:** Todos os novos componentes de UI devem ser baseados ou reutilizados de [shadcn/ui](https://ui.shadcn.com/).
- **CSS Standardized:** O CSS deve ser padronizado via variáveis do Tailwind/CSS (ex: `text-primary`, `bg-background`, `border-border`). **Proibido o uso de cores ou valores "hardcoded"** para facilitar a troca de temas (Dark/Light/Branding).

### 3. Banco de Dados (Drizzle)
- Use `drizzle-kit` para gerar e rodar migrations.
- Schema definido em `src/db/schema.ts`.
- Conexão via `@neondatabase/serverless` para otimização em ambiente serverless/edge.

---

## 🚨 Regras de Ouro
1.  **Multi-tenancy é lei:** Nunca esqueça de isolar os dados por tenant.
2.  **Segurança:** Rotas protegidas via Middleware.
3.  **UI/UX Premium:** O design deve ser "UAU". Use animações sutis e contrastes elegantes (Dark Mode focado).
4.  **Testes:** Crie testes para lógicas financeiras (cálculo de comissão).
5.  **Testes:** todas as funcionalidades devem ter testes unitários.
6. **SOLID** use as boas praticas de programação.
7. **DRY** não repita código.
8. **Performance** otimize o desempenho do sistema.
9. **Security** use as boas praticas de segurança.
10. **Clean Code**  use as boas praticas de programação.
11. **Schema Validation:** Use Zod para validar todos os dados de entrada (API e Forms).
12. **Security Logs:** Devem ser acessíveis APENAS por administradores.

---
### 🔄 Migrações e Schema
- **Fluxo de Mudança:**
    1. **Toda alteração de banco deve seguir o sistema de migrations.** Nunca altere o schema manualmente ou apenas no `db.ts`.
    2. Criar migration: `npm run migrate:create -- nome_da_mudanca`.
    3. Implementar `up` e `down` no arquivo JS gerado em `migrations/`.
    4. Validar localmente: `npm run migrate:test`.
    5. **Automação:** Ao mergear para `main`, o CI/CD executa `npm run migrate:prod` automaticamente.
- **Idempotência:** Sempre use `IF NOT EXISTS` ou a opção `ifNotExists: true` nas migrations.


## 🔄 Fluxos Críticos
1.  **Onboarding:** Cadastro da Imobiliária -> Pagamento Stripe -> Criação do Tenant.
2.  **Venda:** Registro do Deal -> Cálculo Automático de Comissões -> Atualização de Ranking e TV.
