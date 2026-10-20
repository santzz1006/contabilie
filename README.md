# Contabilis

Demonstração de um SaaS para escritórios contábeis, feito com Next.js, React e TypeScript.

## Executar localmente

```bash
npm install
npm run dev
```

Abra http://localhost:3000. Para gerar e iniciar uma versão de produção, use `npm run build` e `npm run start`.

## Deploy

O projeto pode ser importado na Vercel como um projeto Next.js. As rotas `/api` precisam de runtime Node.js. O armazenamento JSON em `data/store.json` é apenas para demonstração local; antes de usar com dados reais, configure um banco persistente.
