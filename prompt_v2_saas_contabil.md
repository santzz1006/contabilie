# PROMPT V2: Dashboard SaaS para escritórios de contabilidade (Contabilis)

> Como usar: anexe o vídeo de referência, deixe o PDF `Especificacao_Completa_SaaS_Contabilidade_Ideia_A.pdf` e as pastas de skills no projeto, e cole tudo abaixo da linha no Claude Code (ou outro agente com acesso aos arquivos).

---

## PAPEL
Você é Senior Product Designer e Principal Frontend Engineer. Implemente, direto nos arquivos do projeto, a interface de um SaaS B2B por assinatura para escritórios de contabilidade. O vídeo anexado define **estrutura, proporções, ritmo e comportamento**. Não copie textos, números, marca ou temática dele.

## FASE 0: INSPEÇÃO (obrigatória, antes de qualquer código)
1. Veja o vídeo e anote: largura da sidebar, composição do header, grade dos cartões, espaços, tipo de gráfico, tempo e estilo das animações.
2. Leia package.json, rotas, componentes, estilos e dependências. Use a stack que já existe. Se o projeto estiver vazio, use React + TypeScript + Vite + React Router + Tailwind + Lucide React + Recharts + GSAP.
3. Leia o PDF de especificação por inteiro e priorize o que ele manda sobre o que este prompt sugere.
4. Procure e leia, se existirem: `Alpino_Complete`, `glass-ui-main`, `gsap-skills-main`, `neomo-main`, `skill-icons-main`. Se algo não estiver acessível, diga isso. Nunca afirme ter lido o que não leu.
5. Escreva um resumo de até 10 linhas com suas decisões e **implemente em seguida**. Não encerre com plano.
6. Preserve funcionalidades existentes. Não troque a arquitetura sem necessidade.

## 1. TEMAS: BRANCO + LARANJA, CLARO E ESCURO
Implemente com tokens CSS em `:root` e `[data-theme="dark"]`. Na primeira carga, grave `data-theme` explicitamente a partir de `prefers-color-scheme`. Ofereça alternância (claro, escuro, sistema) e persista a escolha com try/catch.

| Token | Claro | Escuro (grafite quente, nunca preto puro) |
|---|---|---|
| fundo | `#FAF8F5` | `#262624` |
| superfície | `#FFFFFF` | `#30302E` |
| superfície elevada | `#F5F1EC` | `#3A3936` |
| borda | `#EEE9E3` | `#43413D` |
| texto | `#1B1917` | `#F5F4EE` |
| texto secundário | `#78716C` | `#A8A29A` |
| laranja | `#F97316` (hover `#EA6A0C`) | `#FF8A4C` (hover `#FF9A64`) |
| laranja suave | `#FFEDD9` | `rgba(255,138,76,.14)` |
| botão escuro | `#1C1917` / texto branco | `#F5F4EE` / texto `#262624` |
| positivo / atenção / erro | `#16A34A` / `#D97706` / `#DC2626` | `#4ADE80` / `#FBBF24` / `#F87171` |

Regras: laranja é destaque, não preenchimento. Use em um único cartão de destaque por tela, séries de gráfico, item ativo, foco e pequenos indicadores. **Sobre laranja claro no tema escuro, use texto escuro (`#2A1608`), não branco.** Contraste mínimo AA nos dois temas. Troca de tema com transição de 200 ms.

## 2. LINGUAGEM DE SUPERFÍCIES (três técnicas, cada uma em seu lugar)
- **Glassmorphism:** só em sidebar, header, popovers, modais e busca. `backdrop-filter: blur(14px) saturate(140%)`, com fallback sólido. Não aninhe vidro dentro de vidro: tooltips dentro da sidebar devem ter fundo sólido.
- **Neumorfismo suave:** só em chips de ícone dos indicadores, item ativo da sidebar e trilho da barra de progresso. Sombra dupla leve; versão inset para pressionado; intensidade reduzida no escuro.
- **Cartões de dados e tabelas:** superfície sólida, borda de 1px, sombra quase imperceptível.
- No máximo uma mancha laranja estática e desfocada ao fundo para dar profundidade ao vidro. Sem neon, sem gradientes decorativos, **sem emojis em nenhum lugar**.

## 3. LAYOUT (seguir o vídeo)
**Sidebar fixa de 72 px**, ícones Lucide com traço de 1.75 px: Visão geral, Clientes, Documentos, Conciliação bancária, Certidões, Simuladores tributários, Sites, Tarefas, Relatórios. Na base: alternador de tema, Configurações e avatar. Item ativo com barra laranja e superfície neumórfica. Tooltip com atraso de 250 ms. Em telas com altura menor que 780 px, reduza botões para 40 px. No mobile (até 860 px) vira gaveta de 256 px **com rótulos ao lado dos ícones**, que fecha ao navegar, ao tocar no fundo e com Esc.

**Header em 3 regiões:** marca própria à esquerda; abas em cápsula ao centro (Visão geral, Atividades, Pendências, Processamento, Relatórios) com aba ativa escura e indicador deslizante; à direita pesquisa (Ctrl+K), notificações, ajuda, tema e menu de perfil. No mobile, as abas passam para uma segunda linha com rolagem horizontal contida.

**Conteúdo:**
- Saudação (28 a 32 px) + frase de estado + seletor de competência. Sem hero gigante.
- **Linha 1 (3 regiões):** cartão principal largo com clientes ativos e botão escuro; grade 2x2 de indicadores (documentos a conferir, conciliações pendentes, certidões em atenção, tarefas a vencer), com **um** em laranja; cartão de gráfico de barras (recebidos x processados por competência) com tooltip e legenda.
- **Linha 2:** acompanhamento mensal (uma barra fina, percentual, contagem, prazo) + tabela de atividades (cliente, atividade, responsável, status, horário) com busca, filtro por status, paginação e estado vazio.
- Breakpoints: 3 colunas, depois 2 (gráfico ocupa a linha inteira), depois 1. Alturas alinhadas por linha. Raios: 18 px grandes, 14 px menores, cápsula só em abas e filtros. Espaçamento em múltiplos de 4. Uma família tipográfica (Geist ou Inter) e números tabulares.

## 4. TELA DE CARREGAMENTO (SVG + GSAP, cerca de 3 s)
Overlay de tela cheia antes do dashboard, usando os tokens de tema:
- SVG com uma folha de lançamento contábil desenhada traço a traço (`pathLength=1` + `stroke-dashoffset`), três linhas de texto, quatro barras subindo (a última em laranja) e um carimbo laranja com check entrando com `back.out`.
- Anel de progresso ao redor com ponto laranja orbitando, percentual contando de 0 a 100 e texto de status trocando com fade ("Preparando a competência", "Conferindo documentos", "Conciliando extratos", "Tudo em ordem").
- Saída em `clip-path: circle()` fechando até 0%, **disparando a entrada do dashboard no início da saída** para as animações se sobreporem.
- Com `prefers-reduced-motion`: fade curto de 200 ms, sem desenho nem contagem animada.

## 5. ANIMAÇÕES (GSAP; nunca duas bibliotecas)
Sequência de entrada do dashboard: ícones da sidebar (stagger 30 ms), header descendo 16 px, saudação, cartão principal vindo da esquerda, indicadores em grade 2x2 com escala .96 a 1, gráfico vindo da direita com barras crescendo de baixo para cima, depois acompanhamento e tabela. Duração de 280 a 400 ms, `power2.out`. Contadores e barra de progresso animam uma vez.

**Armadilhas conhecidas (obrigatório respeitar):**
1. GSAP deixa `transform` inline. **Nunca anime o container da sidebar nem elementos que o CSS move com transform** (gaveta mobile, hover de card). Anime os filhos e use `clearProps: 'transform'` ao terminar.
2. Respeite `prefers-reduced-motion`: sem movimento decorativo, só mudança de estado.
3. Sem animações infinitas, parallax ou partículas.
4. Microinterações de 150 a 200 ms: hover de card sobe 2 px (só se for clicável), botão comprime a .97, foco visível por teclado.
5. Menus e popovers com fade + 6 px de deslocamento; modais com fade + escala .98. Trocar de módulo faz saída e entrada curtas, sem movimento lateral.

## 6. FUNCIONALIDADE REAL
Tudo que parece clicável deve funcionar ou aparecer **desativado com explicação**:
- Navegação entre módulos com transição (módulos sem tela mostram um estado "ainda não implementado" honesto).
- Busca global (Ctrl+K) com módulos e clientes; Enter navega; Esc fecha.
- Menu de perfil (Configurações, tema, encerrar sessão) e popover de notificações. Um popover aberto fecha ao abrir outro, ao clicar fora e com Esc.
- Abas filtram a tabela (Pendências = pendente, Processamento = em análise). Seletor de competência altera progresso, contagem e prazo.
- Cartões de indicador levam ao módulo correspondente (com Enter e foco por teclado).
- Estados de carregamento, erro e vazio nos componentes de dados.
- Camada de serviços separada; dados locais rotulados como "dados de demonstração". Nada de integrações ou mensagens de sucesso falsas.

## 7. ARQUITETURA
Pastas por responsabilidade: `layout`, `sidebar`, `header`, `tabs`, `cards`, `charts`, `progress`, `activity-table`, `command-palette`, `loader`, `theme`, `services`, `motion` (helpers GSAP). Tokens em um único arquivo. Sem arquivo gigante e sem microcomponentes inúteis.

## 8. REGRAS ABSOLUTAS
Nenhum emoji. Nada da marca ou do conteúdo do vídeo. Sem sobreposição ou corte de elementos. Nenhum botão decorativo. Não altere configurações existentes sem checar o impacto. Não declare build ou testes aprovados sem rodar.

## 9. VALIDAÇÃO (obrigatória)
Rode o app e verifique desktop (1440), tablet (820) e celular (390), **nos dois temas**. Confira:
- gaveta mobile abre e fecha; hover dos cards funciona depois da animação de entrada;
- sidebar sem transbordar em altura de 700 px;
- tooltips legíveis; contraste do cartão laranja no escuro;
- Esc fecha popovers, busca e gaveta; Ctrl+K abre a busca;
- sem rolagem horizontal da página; reduced-motion funcionando;
- loader fecha e o dashboard anima sem flash.

Corrija o que encontrar. Se não puder validar visualmente, diga isso explicitamente.

**Prioridade máxima:** fidelidade à estrutura e às proporções do vídeo, com identidade própria branco e laranja, dois temas polidos, loader criativo e conteúdo 100% contábil.
