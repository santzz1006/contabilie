# Integrações e deploy do Contabilis

## Desenvolvimento local

1. Copie `.env.example` para `.env.local`.
2. Defina `AUTH_SECRET` como uma chave aleatória longa.
3. Execute `npm install` e `npm run dev`.

O sistema inicializa com os dados fictícios de demonstração de `src/lib/seed-data.json` e grava as alterações locais em `data/store.json`. Esse arquivo de trabalho não deve ser versionado.

## E-mail e WhatsApp

O fluxo de redefinição de senha envia e-mail pelo Resend quando `RESEND_API_KEY`, `RESEND_FROM_EMAIL` e `APP_BASE_URL` estão configurados. Sem configuração, a API retorna erro explícito e não informa que enviou.

Os lembretes de WhatsApp e e-mail abrem o aplicativo configurado com uma mensagem preenchida e registram a preparação no sistema. O usuário ainda confirma o envio. Para envio e confirmação de leitura automáticos, será necessária uma integração autorizada com a WhatsApp Business Platform, webhooks e credenciais da empresa. O app não declara entrega ou leitura antes disso.

## Banco de dados

O repositório atual é um adaptador local em arquivo JSON, adequado para desenvolvimento e demonstração em uma única instância. Antes de hospedar em uma plataforma serverless ou permitir uso simultâneo, substitua `DatabaseStore` em `src/lib/db.ts` por um adaptador persistente (por exemplo PostgreSQL) que implemente os mesmos métodos de leitura/gravação. Mantenha `tenantId` em todas as consultas e use transações para operações que escrevem múltiplas entidades.

Uploads também estão no armazenamento local; para produção, devem usar armazenamento de objetos privado com URLs assinadas. Consultas oficiais de CND exigem integração/autorização do serviço governamental correspondente; até lá, a conferência manual continua disponível e a ação automática informa que não está configurada.

O deploy do Next.js precisa hospedar as páginas e as rotas `/api`. GitHub Pages é hospedagem estática e não executa essas rotas. Vercel executa o Next.js, mas a persistência em arquivo local não serve como banco durável entre instâncias/deploys; conecte um banco e armazenamento persistente antes de uso real.
