# Handoff: Hidro Scan — App de análise de pH por câmera

## Visão geral
Hidro Scan é um app mobile (iOS/Android) que analisa **tiras de teste de pH** através da câmera do celular. O usuário tira no mínimo 3 fotos com flash de uma tira, o app extrai a cor de cada foto, mapeia para o espectro de pH (indicador universal 0–14), faz a média e devolve o valor final com classificação (Ácido / Aceitável / Ideal / Básico), comparativo com a faixa segura e recomendação de ajuste.

O app é **100% gratuito, offline e sem conta**. Todos os registros ficam armazenados localmente no dispositivo (sugestão: SQLite). Não há backend, sync em nuvem nem paywall.

Dois casos de uso são suportados, alternáveis: **Piscina & Spa** e **Aquário**. Cada um tem faixas seguras, nomes de amostras e recomendações próprias.

## Sobre os arquivos de design
Os arquivos deste pacote são **referências de design feitas em HTML/React (via Babel no navegador)** — protótipos que mostram a aparência e o comportamento pretendidos, **não código de produção para copiar diretamente**.

A tarefa é **recriar estes designs no ambiente do seu codebase** (React Native, Flutter, SwiftUI, Jetpack Compose, etc.) usando os padrões e bibliotecas já estabelecidos nele. Se ainda não existe um app, escolha o framework mais adequado (para um app mobile offline com câmera + SQLite, **React Native + Expo** ou **Flutter** são boas escolhas) e implemente os designs lá.

Os arquivos `.jsx` são organizados como: dados/ciência do pH (`data.js`), componentes compartilhados (`components.jsx`), telas principais (`screens-main.jsx`), fluxo de captura (`screens-capture.jsx`), e dois pontos de entrada HTML (protótipo navegável e canvas de telas estáticas). Use-os como fonte da verdade para medidas, cores, textos e lógica.

## Fidelidade
**Alta fidelidade (hifi).** Cores, tipografia, espaçamentos, raios e animações são finais. Recrie a UI pixel-perfect usando as bibliotecas do seu codebase. As animações (orbes de vidro, shimmer do espectro, scan da câmera, pulse da análise) são parte do design — reproduza-as com a engine de animação do framework alvo.

---

## Telas / Views

O app tem **5 abas** (bottom nav) + telas de fluxo. A bottom nav tem 5 slots; o central é um FAB preto (câmera) elevado.

Ordem da nav: **Visão Geral (grid) · Amostras (gota) · [FAB Câmera] · Lembretes (calendário) · Perfil (usuário)**.

### 1. Onboarding (3 passos)
- **Propósito**: apresentar o app e escolher o caso de uso.
- **Layout**: tela cheia, padding `70px 24px 40px`, coluna flex. Topo: 3 barras de progresso (height 3px, gap 6px) — preenchidas em `#0A0A0A`, vazias em `rgba(0,0,0,.1)`. Bloco visual: glass card de 280px de altura, radius 28. Abaixo: rótulo "Passo N de 3", título (Outfit 32px weight 400), subtítulo (14px `rgba(0,0,0,.6)`). Rodapé: botão voltar (54×54, radius 18) + botão primário preto full-width (height 54).
- **Passo 1**: logo + wordmark "Hidro Scan". **Passo 2**: mock de tira com cantos de viewfinder. **Passo 3**: dois cards de escolha (Piscina & Spa / Aquário), selecionado fica preto.
- **Copy**: 
  - "Meça o pH com sua câmera" / "Hidro Scan analisa fotos de tiras de teste e devolve o pH em segundos."
  - "Tire 3 fotos com flash" / "Capturas acumulativas reduzem o erro de iluminação. Vamos te guiar."
  - "O que você monitora?" / "Personalize as faixas seguras e as recomendações."
  - Botões: "Continuar" → "Começar a medir".

### 2. Visão Geral (Home / Dashboard)
- **Propósito**: panorama da última leitura + estatísticas + histórico recente.
- **Layout**: padding `70px 18px 110px` (110 embaixo pra não cobrir a nav), fundo `#FAFAFA`.
  - Topbar: logo (36px) à esquerda; à direita botão de sino (38×38, com bolinha de notificação vermelha `#E0331D`) + avatar "JL" (38×38, radius 12).
  - Eyebrow: "N piscinas monitorando" (11px). Título: "Visão Geral" (Outfit 38px, weight 400).
  - **Hero glass card** (height 170, com 2 cards decorativos atrás levemente deslocados): rótulo "Última leitura" com ícone raio; valor de pH grande (Outfit 56px weight 300, vírgula decimal pt-BR); chip de status preto com cor do nível; barra de espectro de pH animada embaixo.
  - Chips de amostras (scroll horizontal): cada um mostra ícone + nome + valor de pH.
  - 2 stat cards lado a lado: "Total leituras" (BigStat + MiniBar) e "Em faixa" (82,4% + MiniBar).
  - Card de tendência: "Tendência" + média geral + sparkline de barras (30 dias).
  - CTA preto "Nova leitura · Câmera · 3 fotos com flash".
  - Lista "Histórico recente": cards com swatch de cor do pH, nome, tempo relativo + classificação, valor.

### 3. Amostras (Minhas piscinas / Meus aquários)
- **Propósito**: lista de tanques/piscinas monitorados.
- **Layout**: header com eyebrow + título + botão "+" preto (42×42). Cards (radius 22, padding 18): ícone colorido pela cor do pH (48×48), nome + sublocal, BigStat do valor + classificação colorida à direita; sparkline de barras (30 dias); rodapé "30 dias · N leituras" + delta de tendência com seta (↑ verde `#2EA38E` / ↓ vermelho `#E0331D`).

### 4. Câmera (Captura)
- **Propósito**: capturar no mínimo 3 fotos da tira com flash.
- **Layout**: fundo preto `#0A0A0A`. Viewfinder simulado (radial gradient + grão). Tira de teste flutuando no centro (rotação -6°, animação float). **Crosshair**: 4 cantos brancos (3px) + linha de scan verde animada (`#76FB91`, glow). 
  - Topbar (top 60): botão X (glass), pílula com ícone+nome da amostra, botão de flash (ativo = fundo `#76FB91`, ícone preto).
  - Pílula de instrução (top 116): contador "N/3" em círculo verde + texto dinâmico ("Tire mais X fotos" / "Pronto para analisar") + "Flash ativo · Alinhe a tira".
  - Rodapé (bottom 60): preview das fotos (44×56, swatch da cor + valor); linha de controles: botão galeria, **shutter** (78×78 branco com miolo verde), botão confirmar (verde quando ≥3 fotos).
- **Regra**: mínimo 3 fotos (`MIN_PHOTOS = 3`). Cada foto gera uma leitura com jitter ±0.3 em torno do valor "real". O botão confirmar só habilita com ≥3 fotos.

### 5. Analisando
- **Propósito**: animação de processamento enquanto combina as fotos.
- **Layout**: glass card com **orbe de cor pulsante** (radial gradient da cor do pH, blur 8px, animação pulse) + círculo central (110×110) com o valor sendo "varrido" (anima de 0 até o valor final em ~2.2s, ease-out cubic). Barra de espectro. Lista das fotos combinadas (fade-in escalonado, delay 0.18s entre itens). Rodapé "● Processando..." (blink).

### 6. Resultado
- **Propósito**: valor final + classificação + comparativo + recomendação.
- **Layout**: header com voltar + "Resultado da leitura". 
  - **Hero glass card**: swatch de cor (92×92 com animação de onda interna), pH gigante (Outfit 72px weight 300), barra de espectro animada, faixa de status com "Confiança N%".
  - Card comparativo: 3 colunas (Medido / Ideal / Δ) + **RangeBar** (barra horizontal mostrando faixa segura como banda colorida e marcador do valor — preto se dentro, vermelho `#E0331D` se fora).
  - Card recomendação: título + corpo (texto contextual conforme nível — ver seção Recomendações).
  - Card "N fotos capturadas": swatches.
  - Ações: "Refazer" (outline) + "Salvar leitura" (preto, 2/3 da largura).

### 7. Detalhe do registro
- **Propósito**: ver um registro salvo do histórico.
- **Layout**: header voltar + "Registro" + botão compartilhar. Glass card com pH gigante (84px), status, data/hora, espectro. Card "Fotos capturadas" + confiança. Card "Próxima ação sugerida" (recomendação).

### 8. Lembretes
- **Propósito**: agenda de testes recorrentes.
- **Layout**: header + botão "+". Glass card "Esta semana" (7 dias S-T-Q-Q-S-S-D, dia atual destacado preto, pontinhos marcam dias com teste). Lista "Próximos": cards com ícone, label, "tempo · recorrência", e **toggle** (44×26, ligado = verde `#76FB91`).

### 9. Perfil
- **Propósito**: dados do usuário + configurações + troca de modo.
- **Layout**: título "Perfil". Glass card de usuário (avatar 58×58 preto "JL", nome, email, badge "100% offline" cinza). 3 stats (Leituras / Amostras / Sequência). Card "Modo de uso" com 2 botões (Piscina / Aquário, selecionado preto). Lista de settings: Calibração da câmera, Marca da tira de teste, Notificações, Exportar histórico (CSV · PDF · gerados no aparelho), Privacidade dos dados (Tudo armazenado localmente), Sobre (v1.4.0 · Gratuito e sem conta).

---

## Interações & Comportamento
- **Navegação**: bottom nav troca de rota. FAB central e CTAs abrem a câmera. Tocar num card de histórico abre o Detalhe.
- **Fluxo de captura**: viewfinder → (3+ fotos) → analyzing (anima ~2.5s) → result → salvar volta pra Home com o novo registro no topo.
- **Animações** (todas em CSS, reproduza no framework alvo):
  - `orbA/B/C`: orbes de luz nos glass cards, translate+scale, 8/11/14s ease-in-out infinite.
  - `shimmer`: brilho passando no espectro, 3.5s.
  - `scan`: linha de scan da câmera sobe/desce, 2.4s.
  - `float`: tira flutua, 4s.
  - `pulse`: orbe da análise, 2.4s.
  - `wave`: onda dentro do swatch do resultado, 4s.
  - `fadeIn`: itens de lista, 0.4s, delay escalonado.
  - Transições de valor (pH no espectro/marcador): `cubic-bezier(.4,1.2,.4,1)`, 0.6–0.8s.
- **Cor primária adaptativa**: opção em que a cor primária do app deriva da **média de pH de todas as amostras** (`phToColor(média)`, levemente clareada). Implementar como tema dinâmico.

## State Management
- `route`: tela atual (onboarding | home | samples | capture | reminders | profile | detail).
- `useCaseId`: 'pool' | 'aquarium' — define faixas, amostras, recomendações.
- `records`: lista de leituras salvas (persistir em SQLite). Cada record: `{ id, sampleId, ph, ts, photos: [cores], confidence }`.
- `openRecord`: registro aberto no Detalhe.
- Captura: `stage` (viewfinder/analyzing/result), `photos[]`, `flashOn`, `sampleId`, `animPh`, `finalPh`.
- **Persistência sugerida (SQLite)**: tabelas `samples` (id, name, sub, use_case, icon, color) e `readings` (id, sample_id, ph, ts, confidence, photos_json). Estatísticas (% em faixa, média, tendência) são derivadas por query.

## Design Tokens
- **Cores primárias**: Verde `#76FB91` (fixa) · pH-adaptativa (derivada) · Quente `#FFD66B`.
- **Tinta**: `#0A0A0A` (preto principal), fundo `#FAFAFA`, superfícies brancas `#fff`.
- **Espectro de pH** (indicador universal, 15 paradas 0→14): `#C71F2D #E0331D #EC5A1B #F08A1B #F1B72A #D6C736 #A6CA47 #5DBE6E #2EA38E #2477B0 #2456B3 #3A3AAE #5331A4 #5A1F84 #3F1456`. Função `phToColor(ph)` interpola linearmente entre as paradas.
- **Status**: Ideal `#5DBE6E` · Aceitável `#D6C736` · Ácido `#E0331D` · Básico `#3A3AAE`.
- **Texto secundário**: `rgba(0,0,0,.5)` / `.55` / `.6` / `.65`.
- **Tipografia**: **Outfit** (Google Fonts), pesos 300/400/500/600. Números usam `font-variant-numeric: tabular-nums` e vírgula decimal (pt-BR). Títulos com `letter-spacing: -0.02em`.
- **Raios**: cards 22 · glass cards 24 · chips/botões internos 12–18 · pílulas 999.
- **Sombras**: cards `0 1px 2px rgba(0,0,0,.04)`; glass `0 8px 24px rgba(0,0,0,.05)`; botões pretos `0 8px 20px rgba(0,0,0,.25)`.
- **Espaçamento de tela**: padding lateral 18px; topo 70px (status bar); fundo 110px (bottom nav).

## Faixas e recomendações por caso de uso
- **Piscina & Spa**: ideal 7.4, faixa segura 7.2–7.6, aceitável 7.0–7.8.
  - Baixo: "Adicionar barrilha leve" — bicarbonato 80g/m³, re-testar em 6h.
  - Alto: "Reduzir com ácido muriático" — redutor 25ml/m³, testar em 4h.
- **Aquário**: ideal 7.0, faixa segura 6.8–7.4, aceitável 6.5–7.8.
  - Baixo: "Aumentar dureza KH" — bicarbonato dissolvido + TPA 10%.
  - Alto: "Reduzir com troca parcial" — TPA 20% com água de osmose por 3 dias.
- Amostras piscina: Piscina principal (32m³), Spa aquecido (1.8m³), Piscina infantil (0.6m³).
- Amostras aquário: Plantado 200L, Marinho recifal 150L, Bettário 5L.

## Ícones
Conjunto de ícones SVG de traço (strokeWidth 1.6–2.2), 24×24 viewBox, definidos em `components.jsx` no componente `Icon`. **Não usar emoji.** Ícones de amostra: `pool`, `spa`, `wading`, `plant`, `fish`, `betta`. Nav/UI: `grid`, `droplet`, `camera`, `calendar`, `user`, `bell`, `chevR/chevL`, `check`, `x`, `flash`, `trend`, `target`, `sparkle`, `shield`, `flask`, `history`, `info`, `arrowUp/arrowDown`. Substitua por uma lib equivalente (Lucide, SF Symbols, Material Symbols) mantendo o estilo de traço fino.

## Assets
Nenhuma imagem externa — tudo é vetorial/CSS. Fonte Outfit via Google Fonts. O logo é uma gota desenhada em SVG dentro de um quadrado arredondado com gradiente verde.

## Arquivos neste pacote
- `data.js` — ciência do pH (espectro, `phToColor`, `classify`, `recommendation`), casos de uso, dados mock, histórico.
- `components.jsx` — `Icon`, `GlassCard`, `Card`, `MiniBar`, `PhSpectrum`, `Logo`, `Pill`, `BottomNav`, `CardHeader`, `BigStat`, `Sparkline`, `ArcGauge`.
- `screens-main.jsx` — Onboarding, Home, Samples, Reminders, Profile.
- `screens-capture.jsx` — fluxo de captura (Viewfinder, Analyzing, Result), Detail, RangeBar.
- `app.jsx` — root: roteamento, tweaks, cor adaptativa, geração de mock records.
- `Hidro Scan.html` — protótipo navegável completo (ponto de entrada).
- `Hidro Scan — Telas.html` — canvas com todas as telas estáticas lado a lado.
- `ios-frame.jsx`, `tweaks-panel.jsx`, `design-canvas.jsx` — utilitários do protótipo (não fazem parte do produto; só do ambiente de preview).
