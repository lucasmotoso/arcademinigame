# 🎮 Arcade Mini Game 2.0 - Renovation

Renovação completa do clássico projeto Arcade Mini Game com tecnologias modernas, responsividade total e funcionalidades avançadas.

## 📋 Status Atual - FASE 1: Setup ✅

A estrutura do projeto foi completamente planejada e configurada. Todos os arquivos de inicialização estão prontos!

### ✅ Concluído:
- ✓ `package.json` - Dependências modernas (esbuild, eslint, prettier)
- ✓ `.eslintrc.json` - Configuração de linting
- ✓ `.prettierrc.json` - Formatação automática
- ✓ `.gitignore` - Padrões de exclusão
- ✓ `index-new.html` - HTML semântico moderno
- ✓ Scripts de inicialização (4 opções)

### ⏳ Próxima etapa:
Executar o script de inicialização para criar a estrutura de pastas

---

## 🚀 Quick Start

### 1️⃣ Execute o Script de Inicialização

Escolha UMA das opções abaixo e execute no seu terminal na pasta do projeto:

**Opção A: PowerShell (Windows - RECOMENDADO)**
```powershell
.\init.ps1
```

**Opção B: Python**
```bash
python init-structure.py
```

**Opção C: Node.js**
```bash
node setup-dirs.js
```

**Opção D: Bash/Git Bash**
```bash
bash full-init.sh
```

### 2️⃣ Instale as Dependências
```bash
npm install
```

### 3️⃣ Inicie o Desenvolvimento
```bash
npm run dev
```

O projeto será buildado automaticamente e servido localmente.

---

## 📁 Estrutura do Projeto (Após Init)

```
arcade-minigame/
├── src/
│   ├── index.js                    # Entry point
│   ├── core/
│   │   └── app.js                  # App initialization
│   ├── components/
│   │   ├── navigation.js           # Menu & nav
│   │   └── game-cards.js           # Game card interactions
│   ├── games/
│   │   ├── pong/                   # Pong game
│   │   ├── snake/                  # Snake game
│   │   └── sinuca/                 # Sinuca game
│   ├── styles/
│   │   └── main.scss               # Main styles
│   └── utils/
│       ├── theme.js                # Theme system
│       └── storage.js              # LocalStorage manager
├── dist/                           # Build output
├── index-new.html                  # New homepage
├── package.json                    # Dependencies
├── .eslintrc.json                  # Linting rules
├── .prettierrc.json                # Format config
└── README.md                       # This file
```

---

## 🛠️ Scripts Disponíveis

Após `npm install`, você terá os seguintes comandos:

```bash
# Desenvolvimento com hot-reload
npm run dev

# Build otimizado para produção
npm run build

# Verificar erros de linting
npm run lint

# Formatar código automaticamente
npm run format

# Preview da versão buildada
npm run preview
```

---

## 🎯 Próximas Fases

### FASE 2: Core Principal (Homepage)
- [ ] Refatorar HTML com semântica moderna
- [ ] CSS responsivo mobile-first
- [ ] Remover jQuery e usar JS puro
- [ ] Menu responsivo com hamburger
- [ ] Animações melhoradas

### FASE 3: Renovação dos Jogos
- [ ] Refatorar Pong
- [ ] Refatorar Snake
- [ ] Refatorar Sinuca
- [ ] Sistema compartilhado de scores

### FASE 4: Funcionalidades Avançadas
- [ ] Efeitos sonoros (Web Audio API)
- [ ] Vibração para mobile (Haptic API)
- [ ] Menu de configurações
- [ ] Temas (dark/light)

### FASE 5: Otimizações
- [ ] Compressão de imagens
- [ ] Lazy loading
- [ ] Service Worker (PWA)
- [ ] Performance audit

### FASE 6: Deploy
- [ ] Build final
- [ ] Deploy na Netlify/Vercel
- [ ] Documentação completa

---

## 💻 Requisitos

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** 9+ (vem com Node)
- **Git** (para versionamento)

---

## 🎨 Design & Estética

O projeto mantém a essência retrô/vaporwave com:
- **Paleta Neon**: Verde #00ff88, Rosa #ff006e, Cyan #00d4ff
- **Background Dark**: #0a0e27
- **Fonte Monospace**: Courier New (retrô hacker)
- **Efeitos Glow**: Neon shadow effects
- **Responsividade**: Mobile-first approach

---

## 🔧 Troubleshooting

### "npm: command not found"
Instale o [Node.js](https://nodejs.org/) versão 18 ou superior.

### "PowerShell não reconhece o script"
Execute: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

### Script .ps1 não funciona
Use a opção Python: `python init-structure.py`

---

## 📚 Documentação

- `SETUP_PHASE1.md` - Detalhes da fase 1
- `.eslintrc.json` - Regras de linting
- `.prettierrc.json` - Configuração de formatação

---

## 👨‍💻 Desenvolvedor

**Lucas Motoso**
- GitHub: [@lucasmotoso](https://github.com/lucasmotoso)
- LinkedIn: [Lucas Motoso](https://linkedin.com/in/lucas-motoso-248586119/)
- Email: lucasmotoso@gmail.com

---

## 📝 Licença

MIT - Livre para uso pessoal e comercial

---

## 🎮 Vamos Começar!

Execute agora o script de inicialização e comece a renovação do seu projeto! 🚀

```powershell
.\init.ps1
```

Qualquer dúvida, consulte `SETUP_PHASE1.md`!
