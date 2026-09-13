# Catálogo de Modelos LLM

Aplicação **Single Page (SPA)** que consome o JSON oficial de _pricing_ da [LiteLLM](https://github.com/BerriAI/litellm) e o exibe em uma tabela interativa, moderna e filtrável. Construída com **Vue 3 + Vite + Tailwind CSS**.

## ✨ Funcionalidades

- **Busca por nome** do modelo (em tempo real).
- **Filtro por provedor** — dropdown populado dinamicamente com todos os `litellm_provider` únicos do JSON.
- **Ordenação** por campo (nome, provedor, contexto, custo de entrada/saída) em ordem **crescente** ou **decrescente**.
- **Detalhes em accordion** — botão por linha que expande o objeto JSON completo e formatado de cada modelo.
- Formatação amigável:
  - Limite de contexto com separador de milhar (padrão pt-BR, ex.: `128.000`).
  - Custo por **1 milhão de tokens** com prefixo `$` e até 4 casas decimais.
- Estados de **carregamento** (spinner) e **erro** (alerta com "Tentar novamente") caso o `fetch` falhe.

## 🛠️ Tecnologias

| Ferramenta            | Versão  | Papel                                      |
| --------------------- | ------- | ------------------------------------------ |
| Vue                   | ^3.5.42 | Framework (Composition API + `<script setup>`) |
| Vite                  | ^8.3.0  | Build/dev server                           |
| Tailwind CSS          | ^4.3.3  | Estilização (via plugin `@tailwindcss/vite`) |
| @vitejs/plugin-vue    | ^6.0.8  | Suporte a SFCs no Vite                     |

> **Tailwind v4**: a configuração é feita apenas com `@import "tailwindcss";` no CSS e o plugin no `vite.config.js` — não há `tailwind.config.js`.

## 📊 Fonte de dados

- **URL:** <https://raw.githubusercontent.com/BerriAI/litellm/refs/heads/main/model_prices_and_context_window.json>
- O JSON é um **objeto** cujas **chaves** são os nomes dos modelos. O app o transforma em um **Array**, ignorando a chave boilerplate **`sample_spec`**.

## 🧠 Regras de negócio

| Regra | Descrição |
| ----- | --------- |
| Ignorar `sample_spec` | Chave de exemplo do JSON, não é um modelo real. Filtrar em `useModels.js`. |
| Preço × 1.000.000 | O JSON informa o custo de **1 token**. Para exibir "custo por 1 milhão de tokens", multiplica-se por `1_000_000`. |
| Formatação de contexto | `Intl.NumberFormat('pt-BR')` — separador de milhar com ponto (ex.: `128.000`). |
| Formatação de preço | `Intl.NumberFormat('en-US', { currency: 'USD', ... })` — prefixo `$`, mínimo 2 e máximo 4 casas decimais. |
| Valores ausentes | Campos inexistentes (ex.: modelos de imagem/embedding sem custo por token) são exibidos como `—`, nunca como `$0.00`. |
| Ordenação | Valores `null` vão sempre para o final, independente da direção. |

## 📁 Estrutura

```
llm_catalog/
├── index.html                     # Entrada (lang="pt-BR", título da página)
├── vite.config.js                 # Plugins: vue() + tailwindcss()
├── src/
│   ├── main.js                    # Bootstrap do Vue
│   ├── style.css                  # @import "tailwindcss" + estilos base
│   ├── App.vue                    # Layout, filtros, ordenação, estados
│   ├── components/
│   │   └── ModelsTable.vue        # Tabela responsiva + accordion de detalhes
│   ├── composables/
│   │   └── useModels.js           # fetch, transformação e regras de negócio
│   └── utils/
│       └── format.js              # Helpers de formatação (contexto e preço)
```

## 🚀 Como rodar

### Pré-requisitos
- Node.js (testado com v24) e npm.

### Instalação
```bash
npm install
```

### Desenvolvimento
```bash
npm run dev
```
Acesse a URL exibida no terminal (por padrão `http://localhost:5173`).

### Build de produção
```bash
npm run build
```

### Preview do build
```bash
npm run preview
```

## 🔌 Como os dados fluem

1. `useModels()` é chamado no `App.vue` e dispara o `fetch` assim que o app monta.
2. O JSON (objeto `{ "nome": { ...dados } }`) vira um **Array** de modelos, filtrando `sample_spec` e calculando `inputCostPerMillion` / `outputCostPerMillion`.
3. O `App.vue` mantém os filtros (busca + provedor) e a ordenação em `computed`:
   - `filteredModels` → aplica a busca e o provedor.
   - `sortedModels` → aplica a ordenação sobre a lista filtrada.
4. A `ModelsTable` recebe a lista final e renderiza a tabela + o accordion de detalhes (`JSON.stringify(model.raw, null, 2)`).

> **Nota:** o JSON oficial contém chaves duplicadas (ex.: variações de maiúsculas/minúsculas). Isso é tratado nativamente pelo `JSON.parse` do navegador ("última chave vence"). Apenas o PowerShell `ConvertFrom-Json` (estrito) falha nesse caso — por isso, inspeções dos dados devem ser feitas com Node.js.

