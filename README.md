# Pokédex

Uma Pokédex web moderna e interativa, construída com React, TypeScript e Vite, consumindo dados em tempo real da [PokéAPI](https://pokeapi.co/). Além da navegação e busca de Pokémon, o projeto conta com um Montador de Times com compartilhamento via link.

🔗 **Demo:** [pokedex.lucasribeiro.dev.br](https://pokedex.lucasribeiro.dev.br/)

---

## ✨ Funcionalidades

- **Catálogo de Pokémon** com carregamento sob demanda (lazy loading) para melhor performance
- **Busca e detalhes completos** de cada Pokémon: tipos, estatísticas base e artwork oficial
- **Cadeia de evolução** resolvida automaticamente a partir da espécie
- **Montador de Times**: monte um time personalizado com nome, ícone e cor de tema
- **Compartilhamento de times** via link/token codificado, com importação por outro usuário
- **Cache em memória** das requisições para evitar chamadas duplicadas à API
- **Interface responsiva** com animações fluidas (Motion)

## 🛠️ Tecnologias

| Categoria           | Stack                          |
| ------------------- | ------------------------------ |
| Core                | React 19, TypeScript, Vite 6   |
| Estilização         | Tailwind CSS 4                 |
| Animações & Ícones  | Motion, Phosphor Icons         |
| Dados               | [PokéAPI](https://pokeapi.co/) |
| Servidor (produção) | Express                        |

## 📂 Estrutura do projeto

```
src/
├── assets/            # Ícones, favicon e imagens estáticas
├── components/
│   ├── PokeBallHero.tsx     # Seção de destaque/hero da página
│   ├── PokemonCard.tsx      # Card individual de Pokémon no catálogo
│   ├── PokemonModal.tsx     # Modal com detalhes, stats e evolução
│   ├── TeamBuilder.tsx      # Montagem e customização de times
│   └── TeamImporter.tsx     # Importação de times compartilhados
├── services/
│   └── api.ts          # Integração com a PokéAPI + cache
├── utils/
│   ├── CustomSelect.tsx # Select customizado reutilizável
│   └── sharing.ts       # Codificação/decodificação de times para compartilhamento
├── constants.ts        # Cores, traduções de tipos e estatísticas
├── types.ts            # Tipagens TypeScript (Pokemon, Species, Evolution, etc.)
├── App.tsx             # Componente raiz e orquestração de estado
└── main.tsx            # Ponto de entrada da aplicação
```

## 🚀 Como executar localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) 18+
- npm

### Passo a passo

```bash
# 1. Clone o repositório
git clone https://github.com/Lucas-RCS/Pokedex.git
cd Pokedex

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

### Outros comandos disponíveis

```bash
npm run build     # Gera a build de produção em /dist
npm run preview   # Pré-visualiza a build de produção localmente
npm run lint      # Verifica os tipos com o TypeScript (tsc --noEmit)
```

## 📌 Roadmap

- [ ] Ajustar a visualização das cadeias evolutivas de Pokémon que possuem múltiplas evoluções ou requisitos específicos (itens, troca, felicidade, etc.).

## 👤 Autor

**Lucas Ribeiro**
Desenvolvedor Front-end | UI/UX Design

- GitHub: [@Lucas-RCS](https://github.com/Lucas-RCS)
- Site: [lucasribeiro.dev.br](https://lucasribeiro.dev.br)

## 📄 Licença

Este projeto está disponível para fins de estudo e portfólio.
