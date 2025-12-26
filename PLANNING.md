# Planejamento do Projeto ImobiFlow SaaS

## Visão Geral
ImobiFlow é uma plataforma SaaS B2B projetada para imobiliárias gerenciarem suas operações financeiras, vendas, e promoverem a competitividade saudável através de rankings de vendas.

## Stack Tecnológica Sugerida (Baseada no perfil do desenvolvedor)
- **Frontend**: Next.js 14+ (App Router), Tailwind CSS, Shadcn/UI (para aparência premium).
- **Backend**: Next.js Server Actions / API Routes.
- **Banco de Dados**: PostgreSQL (Neon/Railway) com Drizzle ORM ou Prisma (Drizzle é mais leve para serverless).
- **Pagamentos**: Stripe Integration.
- **Auth**: Auth.js (NextAuth) ou Supabase Auth (Magic Links).
- **Infra**: Vercel ou Railway.

---

## Épicos e User Stories

### 1. Gestão de Multi-Tenancy (SaaS) & Assinaturas
**Objetivo**: Permitir que imobiliárias contratem e configurem o sistema.

*   **US01 - Cadastro de Imobiliária (Tenant)**
    *   **Como** administrador da imobiliária,
    *   **Quero** criar uma conta no ImobiFlow,
    *   **Para** que eu possa começar a usar o sistema.
    *   **Critérios de Aceite**:
        *   Formulário de cadastro com: Nome Fantasia, CNPJ (opcional inicialmente), Email Administrativo.
        *   Criação automática do ambiente/identificador do tenant.
        *   Integração inicial com Stripe para seleção de plano (Trial/Free/Pro).

*   **US02 - Configuração do Perfil da Imobiliária**
    *   **Como** administrador,
    *   **Quero** configurar os detalhes visuais e operacionais da minha empresa,
    *   **Para** que o sistema reflita minha identidade corporativa.
    *   **Critérios de Aceite**:
        *   Upload de Logotipo (armazenamento em R2/S3/UploadThing).
        *   Configuração de Endereço e Telefone de contato.
        *   Definição de metas globais da empresa (ex: VGV Mensal almejado).

*   **US03 - Gestão de Assinatura (Billing)**
    *   **Como** SaaS Admin (dono do ImobiFlow),
    *   **Quero** visualizar assinantes e status de pagamento,
    *   **Para** garantir a receita do produto.
    *   **Critérios de Aceite**:
        *   Dashboard Super Admin listando todas as imobiliárias.
        *   Status da assinatura (Ativo, Inadimplente, Cancelado) sincronizado via Webhook do Stripe.
        *   Bloqueio automático de acesso para inadimplentes após X dias.

### 2. Gestão de Pessoas e Acesso (Segurança)
**Objetivo**: Controle de acesso seguro e simplificado ("passwordless").

*   **US04 - Cadastro de Corretores e Staff**
    *   **Como** gerente/admin,
    *   **Quero** cadastrar corretores, agenciadores e gerentes,
    *   **Para** que eles possam acessar o sistema e ter suas vendas registradas.
    *   **Critérios de Aceite**:
        *   Campos: Nome, Email, CRECI (opcional), Data Nascimento (para aniversariantes), Foto de Perfil.
        *   Definição de permissões (Role): Admin, Gerente, Corretor.
        *   Definição de Metas Individuais (VGV ou Quantidade de Vendas).

*   **US05 - Login via Magic Link**
    *   **Como** corretor,
    *   **Quero** acessar o sistema sem precisar memorizar senha,
    *   **Para** ter acesso rápido e seguro.
    *   **Critérios de Aceite**:
        *   Usuário informa o e-mail na tela de login.
        *   Sistema envia link único com token JWT assinado para o e-mail.
        *   Link tem validade configurável (ex: 24h ou 7 dias se "manter conectado").
        *   Ao clicar, a sessão é criada no navegador.

### 3. Gestão de Imóveis (Inventário)
**Objetivo**: Centralizar base de imóveis para vínculos em vendas.

*   **US06 - Sincronização via API JetImóveis**
    *   **Como** imobiliária que usa JetImóveis,
    *   **Quero** que meus imóveis apareçam automaticamente no ImobiFlow,
    *   **Para** não ter retrabalho de cadastro.
    *   **Critérios de Aceite**:
        *   Rotina (Cron job) ou botão "Sincronizar Agora".
        *   Mapeamento de campos básicos: Referência, Valor, Endereço, Proprietário.

*   **US07 - Importação via Planilha**
    *   **Como** gerente,
    *   **Quero** subir uma planilha Excel/CSV com meus imóveis,
    *   **Para** cadastrar lote de imóveis rapidamente.
    *   **Critérios de Aceite**:
        *   Validação de colunas obrigatórias.
        *   Relatório de erros (ex: "Linha 10 falhou: Valor inválido").

*   **US08 - Cadastro Manual de Imóvel**
    *   **Como** corretor/gerente,
    *   **Quero** cadastrar um imóvel avulso,
    *   **Para** registrar uma venda de oportunidade (ex: parceria).
    *   **Critérios de Aceite**:
        *   Formulário simplificado (não precisa ser um CRM de imóveis completo, apenas dados suficientes para a venda).

### 4. Gestão Financeira e Comissões
**Objetivo**: O coração do sistema. Calcular quem ganha o quê.

*   **US09 - Registro de Venda**
    *   **Como** gerente/secretaria,
    *   **Quero** lançar uma venda concluída,
    *   **Para** oficializar o negócio e gerar comissões.
    *   **Critérios de Aceite**:
        *   Seleção do Imóvel vendido.
        *   Valor Final da Venda.
        *   Data da Venda.
        *   Seleção dos envolvidos:
            *   Corretor(es) (pode ser compartilhado).
            *   Agenciador (quem captou).
            *   Gerente responsável.
        *   Upload de comprovante/contrato (opcional).

*   **US10 - Cálculo e Distribuição de Comissões**
    *   **Como** financeiro,
    *   **Quero** que o sistema calcule a divisão da comissão,
    *   **Para** evitar erros de planilha / contas manuais.
    *   **Critérios de Aceite**:
        *   Configuração de % padrão por imobiliária.
        *   Possibilidade de ajuste manual ("override") caso a caso.
        *   Visualização clara: Valor Venda -> Comissão Total (ex: 6%) -> Parte da Imobiliária / Parte do Corretor / Parte do Agenciador.

*   **US11 - Lançamento de Despesas**
    *   **Como** financeiro,
    *   **Quero** lançar despesas operacionais (marketing, portais, café),
    *   **Para** ter um DRE (Demonstrativo de Resultado) básico.
    *   **Critérios de Aceite**:
        *   Categorização de despesas.
        *   Data e Valor.
        *   Recorrente ou Única.

*   **US14 - Extrato Financeiro do Corretor (Conta Corrente)**
    *   **Como** corretor,
    *   **Quero** ver meu extrato de comissões e adiantamentos (vales),
    *   **Para** ter clareza do quanto tenho a receber no final do mês.
    *   **Critérios de Aceite**:
        *   Tabela de Créditos (Vendas) e Débitos (Vales/Adiantamentos).
        *   Cálculo automático de Saldo a Receber.
        *   Histórico filtrável por período.


### 5. Gamification e Rankings (Motivação)
**Objetivo**: Estimular vendas através da competição visual.

*   **US12 - Ranking de Vendas (Dashboard)**
    *   **Como** corretor,
    *   **Quero** ver minha posição no ranking,
    *   **Para** me sentir motivado a vender mais.
    *   **Critérios de Aceite**:
        *   Filtros: Mês Atual, Trimestre, Ano, Personalizado.
        *   Critério de Ranking: VGV (Volume Geral de Vendas) ou Número de Vendas (configurável).
        *   Visualização de "Pódio" para os Top 3.

*   **US13 - TV Mode (Kiosk)**
    *   **Como** dono da imobiliária,
    *   **Quero** uma url específica otimizada para TV Full HD,
    *   **Para** deixar rodando na televisão do salão de vendas.
    *   **Critérios de Aceite**:
        *   Layout "Dark Mode" de alto contraste.
        *   Atualização em tempo real (polling ou websocket) sem refresh de página.
        *   Rotação automática de telas (Ex: Ranking Geral -> Aniversariantes do Mês -> Destaque da Semana).
        *   Sem menus ou botões visíveis (modo apresentação).

*   **US16 - Integração com WhatsApp (Bot de Comemoração)**
    *   **Como** dono da imobiliária,
    *   **Quero** que o sistema envie uma mensagem automática no grupo da empresa quando uma venda for fechada,
    *   **Para** celebrar conquistas e motivar o time em tempo real.
    *   **Critérios de Aceite**:
        *   Integração via API (ex: Twilio ou WppConnect).
        *   Mensagem customizável com dados da venda (Corretor, Valor, Bairro).
        *   Suporte a emojis e formatação básica.

*   **US17 - Sistema de Conquistas (Badges)**
    *   **Como** corretor,
    *   **Quero** ganhar medalhas virtuais por atingir marcos,
    *   **Para** ter reconhecimento pelos meus feitos além do salário.
    *   **Critérios de Aceite**:
        *   Badges automáticas: "Primeira Venda", "Venda Milionária", "Rei da Captação", "Hat-trick" (3 vendas no mês).
        *   Exibição das badges no perfil do corretor e no Ranking TV.
        *   Notificação visual ao desbloquear uma conquista.

### 6. Gestão de Pipeline (CRM Lite)
**Objetivo**: Acompanhar negociações antes do fechamento.

*   **US18 - Deal War Room (Kanban)**
    *   **Como** gerente/corretor,
    *   **Quero** visualizar minhas negociações em colunas (kanban),
    *   **Para** saber em que estágio cada cliente está e priorizar ações.
    *   **Critérios de Aceite**:
        *   Colunas padrão configuráveis: Proposta, Visita Agendada, Em Negociação, Documentação, Fechado.
        *   Drag-and-drop de cards para mudar de fase.
        *   Visualização rápida do valor potencial do deal e probabilidade de fechamento.


---

## Sugestões de Funcionalidades Extras (Diferenciais)

1.  **Gerador de Posts para Redes Sociais**:
    *   Ao vender, gerar automaticamente uma imagem (com a foto do corretor e do imóvel) escrito "VENDIDO", pronta para story do Instagram.

## Próximos Passos (Plano de Ação)

1.  **Setup do Projeto**: Inicializar Next.js + Tailwind + Database.
2.  **Modelagem de Dados**: Criar o Schema do Banco (Prisma/Drizzle) cobrindo Tenants, Users, Deals, Commissions.
3.  **Auth & Onboarding**: Implementar o login mágico e cadastro de tenant.
4.  **Core da Venda**: Implementar o formulário de vendas e lógica de comissão.
5.  **Dashboards**: Criar as visões de ranking e TV Mode.
