# 🕹️ Arcade Mini Game 2.0

Uma coletânea de minigames clássicos reconstruída com tecnologias web modernas (HTML5, CSS3, e Vanilla JavaScript). O projeto foi totalmente refatorado para entregar uma experiência imersiva baseada nos fliperamas dos anos 90, contando com uma vibrante estética Neon, suporte total para dispositivos móveis e mecânicas aprimoradas!

## 🚀 Novas Funcionalidades (Versão 2.0)

### 🌟 Estética & Experiência Unificada
*   **Filtro CRT & Scanlines:** Todos os jogos executam dentro de molduras de "Gabinete Arcade" com suporte ao clássico efeito de tela de tubo embutido no layout.
*   **Neon & Glitch:** Design system próprio, focado nas cores verde, rosa chiclete e ciano (paleta *cyberpunk/synthwave* vintage). Textos *glitch*, reflexos de *bezel* (luz de borda) nas telas canvas e botões interativos brilhantes.
*   **Mobile-Ready:** Menus, botões emulados e zonas de toque ocultas (touch zones e swipe gestures) adaptados para celulares e tablets em todos os minigames, sem perder o "feeling" original.
*   **Zero Frameworks:** 100% dependência-zero. Apenas HTML, CSS Flexbox/Grid e ES6+ modular puro e veloz.

### 🎱 Sinuca (8-Ball)
*   **Motor de Física Realista (Atualizado):** Refeito do zero para colisões elásticas 2D perfeitas, conservação de momento, atrito da mesa e rebatidas nas tabelas usando vetores reais.
*   **Mira Tátil e Taco "Arrastar & Soltar":** Controles refeitos para puxar o taco de forma intuitiva arrastando a tela, com linha preditiva fantasma da rota da bola principal.
*   **Mesa detalhada:** Texturas de feltro verde ricas e sombras calculadas no runtime. Placar moderno e sistema unificado.

### 🏓 Pong
*   **Efeitos de Partículas e Trails:** Aumenta a velocidade da bola de forma dinâmica. A bola deixa um rastro iluminado no ar, incluindo partículas de explosão (hit-sparks) em cada rebatida ou quando faz ponto ("GOAL").
*   **Inteligência Artificial Escalonável:** Adapta-se perfeitamente e oferece fallback moderno.

### 🐍 Snake (A Cobrinha)
*   **Renderização Independente de 60fps:** Motor de visualização isolado da velocidade de jogo. Mesmo com movimento cadenciado em bloco, as explosões e alertas ocorrem nativamente.
*   **Visual de Próxima Geração 8-bit:** O corpo do Snake possui degradê com iluminação e destaque, olhos baseados na resposta direcional e o alimento pisca pulsante com reflexos especulares. 
*   **Gameplay Animado:** Efeitos de aceleração progressiva, *fade out* ao perder a partida e animações de texto fluídas.

## 🛠️ Como Jogar (Localmente)

Por ser totalmente escrito em Vanilla JS sem build-step obrigatório, basta clonar e executar um servidor estático local!

```bash
# Clone o repositório
git clone https://github.com/lucasmotoso/arcademinigame.git

# Entre na pasta
cd arcademinigame

# Abra com Live Server (VS Code) ou Python, Node local, como:
npx serve .
# ou
python -m http.server
```

### Controles Principais
- **Home:** Navegação por clique nos botões estilo moeda (Coin-Op).
- **Pong:** 
  - Player 1: `W` ou `A`, Player 2 (Duo): `P`, `L` ou Touch. 
- **Snake:** 
  - `Setas` ou Teclas `W A S D` para mudar a direção ou Swipe (arrastar dedo) na tela. 
- **Sinuca:** 
  - Mouse ou Touchscreen. Arraste para trás para mirar com o preditor e solte para aplicar a força.

## 👨‍💻 Autores e Contribuição
Desenvolvido e mantido por **Lucas Motoso** ([@lucasmotoso](https://github.com/lucasmotoso)).  
Feito com 💚 e muita paixão pela Era de Ouro dos Arcades. 
