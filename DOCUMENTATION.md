# Documentação do Projeto: Criminal Case Image Aggregator

### 1. Visão Geral

O **Criminal Case Image Aggregator** é uma aplicação web de front-end que utiliza o poder da Inteligência Artificial Generativa do Google para criar um arquivo visual para casos criminais e personalidades notórias. A partir de nomes ou casos inseridos pelo usuário, o sistema gera uma série de imagens fotorrealistas e metadados contextualmente relevantes, como se tivessem sido extraídos de arquivos de notícias, registros policiais ou processos judiciais.

O objetivo principal é fornecer uma ferramenta para criadores de conteúdo, documentaristas e pesquisadores, permitindo-lhes visualizar e compilar material de apoio para narrativas e estudos de caso de forma rápida e segura, sem usar imagens reais que possam ter restrições de direitos autorais ou exibir conteúdo sensível.

### 2. Principais Funcionalidades

*   **Busca em Lote:** Permite ao usuário inserir múltiplos nomes de casos ou criminosos, um por linha, para processamento simultâneo.
*   **Geração de Imagens por IA:** Utiliza um processo de duas etapas:
    1.  Gera descrições textuais detalhadas e metadados plausíveis (ano, fonte, tipo de imagem).
    2.  Usa essas descrições como prompts para gerar imagens fotorrealistas e contextualmente adequadas.
*   **Opções de Personalização:** O usuário pode definir o idioma para as descrições das imagens (Inglês, Português, Espanhol) e o número de imagens a serem geradas por termo.
*   **Interface Reativa e Moderna:** Construída com React e Tailwind CSS, oferece uma experiência de usuário limpa, responsiva e com feedback visual claro durante o carregamento e em caso de erros.
*   **Resiliência a Erros:** O sistema é projetado para lidar com falhas de API, como limites de taxa, processando as solicitações de imagem sequencialmente e continuando o processo mesmo que a geração de uma única imagem falhe.
*   **Download de Arquivos:** Cada imagem gerada pode ser baixada diretamente pelo navegador com um nome de arquivo pré-formatado.

### 3. Stack de Tecnologia

*   **Framework de Front-end:** [React 19](https://react.dev/)
*   **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
*   **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
*   **API de Inteligência Artificial:** [Google Gemini API (@google/genai)](https://ai.google.dev/)
    *   **Modelo de Texto:** `gemini-2.5-flash` (para gerar metadados e descrições)
    *   **Modelo de Imagem:** `imagen-4.0-generate-001` (para gerar as imagens)

### 4. Estrutura do Projeto

O projeto é organizado em uma estrutura modular para facilitar a manutenção e escalabilidade.

```
/
├── public/
│   └── favicon.svg         # Ícone da aplicação
├── components/
│   ├── Icons.tsx           # Componentes de ícones SVG reutilizáveis
│   ├── ImageCard.tsx       # Card para exibir uma imagem individual e seus metadados
│   ├── ResultsDisplay.tsx  # Componente para exibir a grade de resultados, skeletons de carregamento e erros
│   └── SearchForm.tsx      # Formulário de entrada para o usuário
├── services/
│   └── geminiService.ts    # Lógica central para comunicação com a API do Gemini
├── types.ts                # Definições de tipos e interfaces TypeScript
├── App.tsx                 # Componente principal que gerencia o estado da aplicação
├── index.html              # Ponto de entrada HTML, carrega o Tailwind CSS e o script principal
├── index.tsx               # Ponto de entrada do React, renderiza o componente App
├── metadata.json           # Metadados da aplicação
└── DOCUMENTATION.md        # Este arquivo de documentação
```

#### Descrição dos Arquivos Principais

*   **`index.html`**: A página HTML raiz. Define a estrutura básica, importa o Tailwind CSS via CDN e utiliza um `importmap` para carregar os módulos do React e do Google GenAI.
*   **`index.tsx`**: O ponto de entrada da aplicação React. Renderiza o componente `App` no elemento `div#root` do HTML.
*   **`App.tsx`**: O componente orquestrador. Ele gerencia o estado global, incluindo `isLoading`, `results` e `error`. É responsável por chamar o serviço da API quando o formulário é submetido e passar os dados para os componentes de exibição.
*   **`types.ts`**: Centraliza todas as definições de tipo do TypeScript usadas no projeto, garantindo consistência e segurança de tipo em todo o código.
*   **`services/geminiService.ts`**: O coração da lógica de negócios.
    *   Exporta a função `fetchImageData`, que encapsula toda a interação com a API Gemini.
    *   **Passo 1:** Constrói um prompt detalhado e chama o modelo `gemini-2.5-flash` para gerar um JSON estruturado com descrições e metadados de imagens.
    *   **Passo 2:** Itera sequencialmente sobre as descrições recebidas e chama o modelo `imagen-4.0-generate-001` para gerar cada imagem como uma string base64. A iteração sequencial é uma decisão de design crucial para evitar erros de limite de taxa (429) da API.
*   **`components/`**: Contém todos os componentes React reutilizáveis.
    *   **`SearchForm.tsx`**: Um formulário controlado que coleta a entrada do usuário e aciona a função de busca no componente `App`.
    *   **`ResultsDisplay.tsx`**: Renderiza condicionalmente a UI com base no estado da aplicação: exibe esqueletos de carregamento, mensagens de erro ou a grade de resultados.
    *   **`ImageCard.tsx`**: Apresenta uma única imagem com sua descrição, nome de arquivo gerado e um botão de download funcional.
    *   **`Icons.tsx`**: Fornece um conjunto de ícones SVG como componentes React para uso em toda a UI.

### 5. Fluxo de Dados

1.  **Entrada do Usuário:** O usuário preenche o formulário no componente `SearchForm` (termos de busca, idioma, quantidade de imagens) e clica em "Find Images".
2.  **Acionamento da Busca:** `SearchForm` chama a função `handleSearch` passada como `prop` pelo componente `App`, enviando um objeto com as opções de busca.
3.  **Gerenciamento de Estado:** `App.tsx` define `isLoading` como `true`, limpa resultados e erros anteriores. Em seguida, ele itera sobre os termos de busca e chama a função `fetchImageData` de `geminiService.ts` para cada um.
4.  **Interação com a API:**
    *   `geminiService.ts` envia uma primeira requisição para o modelo de texto do Gemini para obter os metadados.
    *   Após receber a resposta, ele envia requisições sequenciais para o modelo de imagem do Gemini para gerar cada imagem.
    *   A função retorna um objeto contendo um array de imagens (com metadados e a string base64 da imagem).
5.  **Atualização de Estado:** `App.tsx` recebe os dados (ou o erro) do serviço. Ele atualiza o estado `results` com os dados formatados ou o estado `error` se algo falhar. Finalmente, define `isLoading` como `false`.
6.  **Renderização na UI:** A atualização de estado no `App` faz com que o `ResultsDisplay` seja re-renderizado. Ele exibe os resultados, organizando-os por termo de busca e renderizando um `ImageCard` para cada imagem recebida.