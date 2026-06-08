# Hidro Scan

**Leitura de pH por imagem** — um aplicativo mobile que transforma a foto de uma tira de teste em um valor de pH, classifica a água e sugere ajustes.

Projeto de aplicação da disciplina **Algoritmos e Estrutura de Dados II** — Unisapiens · Profa. Rosângela Cunha.

---

## Sobre o projeto

O Hidro Scan usa a câmera do celular para fotografar uma tira de teste de pH. A partir da imagem, o app extrai a cor dos campos reativos da tira e a compara com a tabela de referência do modelo selecionado, estimando o pH (0–14), com classificação (Ácido / Aceitável / Ideal / Básico), comparação com a faixa segura e recomendação de ajuste.

É **100% offline e sem conta**: todos os registros ficam no próprio aparelho.

Dois cenários de uso, alternáveis: **Piscina & Spa** e **Aquário**, cada um com faixas seguras e recomendações próprias.

## Algoritmos e estruturas de dados

O núcleo do projeto é o tratamento de cor e a estimativa do pH:

- **Espectro de pH (interpolação):** o indicador universal é modelado como uma sequência de 15 paradas de cor (0 → 14); valores intermediários são obtidos por interpolação linear entre as paradas — `lib/ph/spectrum.ts`.
- **Distância de cor (CIELAB + ΔE):** conversão sRGB → XYZ → CIELAB e cálculo de ΔE (CIE76) para medir a diferença perceptual entre a cor lida e cada cor de referência — `lib/ph/colorMath.ts`.
- **Casamento por menor distância:** a assinatura de cores lida (uma cor, ou N cores para tiras de múltiplos campos) é comparada a todos os pontos da tabela de referência; escolhe-se o pH de menor soma de ΔE — `lib/strips/match.ts`.
- **Amostragem por região com rejeição de outliers:** a cor de cada campo é estimada pela média de uma grade de pontos sobre a região marcada, descartando pixels de papel branco, sombra e brilho — robusto a ruído e ao ângulo da tira — `lib/strips/analyzeStrip.ts`.
- **Catálogo de modelos de tira:** estrutura que descreve cada marca/modelo (faixa, número de campos, tabela de referência) usada no casamento — `lib/strips/catalog.ts`.
- **Persistência local e estatísticas:** banco SQLite com consultas agregadas (total de leituras, % em faixa, média e tendência diária) — `lib/db/`.

## Funcionalidades

- Leitura de pH por foto, com **alinhamento manual** dos campos da tira (mover, redimensionar e girar a marcação sobre a imagem).
- **Catálogo de tiras** (universal, MN pH-Fix de 4 campos, MQuant, tira de piscina) com prévia da tabela de referência.
- **Locais de amostra** (piscinas/aquários) com histórico e estatísticas.
- **Visão geral** com a última leitura por local, tendência e histórico recente.
- **Lembretes** de teste recorrentes.

## Tecnologias

- React Native + Expo (SDK 54) · TypeScript
- expo-router (navegação) · NativeWind
- SQLite com Drizzle ORM
- React Native Reanimated · react-native-svg · @shopify/react-native-skia (leitura de pixels) · expo-camera · Zustand

## Como rodar

Pré-requisitos: Node 20+, [pnpm](https://pnpm.io) e um dispositivo/emulador Android.

> A câmera e a leitura por pixels exigem um **dev build** nativo (não funcionam no Expo Go).

```bash
pnpm install
pnpm db:generate   # gera as migrações do banco
pnpm android       # gera o dev build e instala no dispositivo
```

Depois do primeiro build, para desenvolvimento:

```bash
pnpm start
```

## Estrutura

```
app/            telas (expo-router)
components/     componentes de UI
lib/ph/         ciência do pH (espectro, cor, matemática)
lib/strips/     catálogo de tiras, amostragem e casamento de cor
lib/db/         schema, queries e migrações (Drizzle/SQLite)
lib/theme/      tokens visuais
store/          estado global (Zustand)
```

## Grupo

- Walace Wilker
- Gabriel da Cruz Ferreira
- Wellington Braga Silvestre
- Anamaria Alves Ferreira
- Mateus Duarte Lima
- Lucas Teixeira Moreira
- Matheus Amaral Marinho
- Davi Martins Gomes

---

<sub>Unisapiens — Algoritmos e Estrutura de Dados II — Profa. Rosângela Cunha</sub>
