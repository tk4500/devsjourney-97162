-----

# 🎮 Dev's Journey: Simulando a Rotina do Programador

[cite_start]**Dev's Journey** é uma Single-Page Application (SPA) e um jogo educacional focado em desmistificar a rotina profissional de um desenvolvedor de software[cite: 5, 64]. [cite_start]O projeto simula desafios reais do dia a dia da área de TI, unindo conceitos de lógica de programação com mecânicas de gamificação que exigem gerenciamento de recursos não-técnicos, como "Stamina" e "Foco"[cite: 6, 51].

🌐 **Jogue agora:** [devsjourney-97162.web.app](https://devsjourney-97162.web.app)

-----

## 💡 O Problema e a Solução

[cite_start]O mercado de TI sofre com a escassez de profissionais, muitas vezes afastados pela percepção de que a programação possui uma barreira de entrada muito alta e uma sintaxe rígida[cite: 54, 192].

[cite_start]Para solucionar isso, o Dev's Journey utiliza a **Aprendizagem Baseada em Jogos (Game-Based Learning)** acoplada à **Programação em Blocos**[cite: 6, 38]. [cite_start]Isso permite que os usuários foquem no raciocínio lógico e na resolução de algoritmos sem se frustrar com erros de sintaxe (como o esquecimento de um ponto e vírgula), transformando a programação em uma montagem de quebra-cabeças[cite: 55, 58].

## ⚙️ Principais Funcionalidades

  * [cite_start]**Programação Visual com Blockly:** Integração profunda com o Google Blockly para a criação de algoritmos usando blocos arrastáveis[cite: 66].
  * [cite_start]**Execução Segura em Sandbox:** Os blocos lógicos são traduzidos para JavaScript e executados em tempo real de forma isolada e segura através da biblioteca `JS-Interpreter`[cite: 67].
  * [cite_start]**Gamificação e Gestão de Recursos:** Mecânicas dinâmicas de Stamina e Foco, simulando interrupções no workflow e exigindo que o jogador gerencie sua "energia" para entregar as tarefas[cite: 51, 151].
  * [cite_start]**Tutoriais Interativos:** Um sistema de onboarding contextual e não-bloqueante guiado pelo mentor "Sérgio Sênior", que apresenta os conceitos lógicos[cite: 119, 120].
  * [cite_start]**Sistema de Progressão:** Salva o progresso dinamicamente, mantendo o controle de níveis desbloqueados e pontuação geral via Leaderboard global[cite: 80, 106].

## 🛠️ Tecnologias Utilizadas

[cite_start]O projeto foi construído utilizando uma stack moderna e robusta, com arquitetura orientada a serviços[cite: 70]:

  * [cite_start]**Frontend:** Angular (v19) para estruturação reativa e PrimeNG para componentes de UI acessíveis e responsivos[cite: 64, 65, 205].
  * [cite_start]**Core Lógico:** Google Blockly (Interface Visual) e JS-Interpreter (Motor de execução de código)[cite: 206].
  * [cite_start]**Backend as a Service (BaaS):** Firebase Firestore (Banco de dados NoSQL) e Firebase Auth (Gestão de Identidade)[cite: 68, 207].
  * [cite_start]**Armazenamento de Mídia:** API do ImgBB integrada via `ImageUploadService` para otimização de upload de avatares[cite: 69, 82].
  * [cite_start]**Segurança:** Dados sensíveis de sessões locais são criptografados utilizando `crypto-js`[cite: 93].

## 🏗️ Arquitetura do Sistema

A aplicação foi rigorosamente modularizada utilizando injeção de dependências do Angular. [cite_start]O estado da aplicação é gerenciado em tempo real (utilizando *Angular Signals*) através de serviços dedicados[cite: 64, 77]:

  * [cite_start]`GameplayService`: O motor central que gerencia estados de vitória/derrota e variáveis dinâmicas do jogo[cite: 77].
  * [cite_start]`BlocklyWorkspaceService` e `InterpreterService`: Atuam como pontes entre a interface do usuário e o ambiente de execução de código isolado[cite: 78, 79].
  * [cite_start]**Estratégia de Cache:** Combinação de Firestore para dados persistentes na nuvem e `sessionStorage`/`localStorage` para caching de progressão e carregamento estático veloz de tutoriais e blocos customizados[cite: 74, 76, 94].

## 📊 Impacto e Resultados

[cite_start]O sistema foi validado com usuários reais, comprovando sua eficácia como ferramenta técnica e educativa[cite: 202, 220]:

  * [cite_start]**Alto Engajamento:** 87,5% dos usuários classificaram a experiência como altamente divertida e engajante (Notas 4 ou 5)[cite: 7, 134].
  * [cite_start]**Efetividade no Aprendizado:** 75% dos participantes reportaram um claro entendimento de conceitos lógicos fundamentais (como *loops* e estruturas condicionais) após interagir com o sistema[cite: 7, 137, 153].
  * [cite_start]O sistema comprovou sucesso em simular desafios além do código, traduzindo bem o ambiente ágil e os desafios não-técnicos da profissão[cite: 8, 141].

## 🚀 Como Rodar o Projeto Localmente

1.  Clone este repositório:
    ```bash
    git clone https://github.com/tk4500/devsjourney-97162.git
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Configure as variáveis de ambiente com suas credenciais do Firebase em `src/environments/environment.ts`.
4.  Inicie o servidor de desenvolvimento:
    ```bash
    ng serve
    ```
5.  Acesse `http://localhost:4200` no seu navegador.

-----

*Desenvolvido por Tarcísio Luiz Pereira Bogo.*

-----
