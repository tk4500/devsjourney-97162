-----

# 🎮 Dev's Journey

![Dev's Journey Cover](https://devsjourney-97162.web.app/level-select-bg.png)

**Acesse o jogo em produção:** [https://devsjourney-97162.web.app](https://devsjourney-97162.web.app)

## 📌 Sobre o Projeto

**Dev's Journey** é uma aplicação web gamificada desenvolvida com o propósito de desmistificar a rotina de um desenvolvedor de software de forma interativa e visual. Atuando como meu Projeto de Conclusão de Curso (TCC) em Análise e Desenvolvimento de Sistemas , o sistema não foca apenas no ensino de lógica de programação, mas também simula os desafios não-técnicos do dia a dia da profissão, exigindo o gerenciamento de recursos como "Stamina" e "Foco".

Para tornar a experiência fluida e à prova de erros de sintaxe para iniciantes, o projeto utiliza a abordagem de Programação em Blocos, permitindo que os usuários construam lógicas complexas de forma lúdica, semelhante a montar um quebra-cabeça.

## 🚀 Principais Funcionalidades

* **Programação Visual Segura:** Integração com o Google Blockly para construção de algoritmos visuais, eliminando frustrações com erros de sintaxe.
* **Execução de Código em Sandbox:** Utilização do JS-Interpreter para compilar e rodar o código JavaScript gerado pelos blocos de forma segura e em tempo real no navegador.
* **Gestão de Estado em Tempo Real:** Mecânicas de jogo (Stamina, Foco, Interrupções) gerenciadas de forma reativa durante a sessão.
* **Sistema de Tutoriais Interativos:** Um mentor virtual ("Sérgio Sênior") guia o usuário através de interfaces sobrepostas não-bloqueantes.
* **Persistência Híbrida de Dados:** Salvamento de progresso usando Google Firestore para usuários autenticados e localStorage (com criptografia via crypto-js) para contas de convidados.
* **Integração de APIs:** Upload e gerenciamento de imagens de perfil utilizando a API do ImgBB.

## 🛠️ Tecnologias e Arquitetura

O sistema foi concebido sob uma **Arquitetura Orientada a Serviços**, garantindo alta modularidade, fácil manutenção e separação clara de responsabilidades no Frontend.

**Stack Tecnológica:**
* **Frontend:** Angular (v19) , PrimeNG (v19).
* **Lógica Engine:** Google Blockly , JS-Interpreter.
* **Backend & Cloud:** Firebase (Firestore, Authentication, Hosting).
* **Design Pattern:** Utilização extensiva de Angular Signals para reatividade eficiente da UI.

**Estrutura de Serviços Core:**
A arquitetura baseia-se em serviços independentes que orquestram a aplicação, como o LevelService (para caching e otimização de requisições ao banco) , o BlocklyWorkspaceService (gestão do ambiente de blocos) , e o InterpreterService (ponte de execução entre o código do usuário e as ações da UI).

## 📊 Impacto e Resultados

Durante as validações de usabilidade e eficácia educacional:
* **87.5%** dos usuários consideraram a experiência altamente engajante.
* **75%** dos testadores reportaram ter aprendido ou consolidado conceitos fundamentais de programação (como Loops, Condicionais e Lógica Sequencial).
* A gestão de "Stamina" e "Foco" foi validada como uma simulação fiel do desgaste e dos desafios não-técnicos diários do desenvolvimento de software.

## ⚙️ Como executar o projeto localmente

1. Clone o repositório:
   bash
   git clone [https://github.com/tk4500/devsjourney-97162.git](https://github.com/tk4500/devsjourney-97162.git)


2.  Instale as dependências:
    bash
    npm install
    
3.  Execute o servidor de desenvolvimento:
    bash
    ng serve
    
4.  Navegue até http://localhost:4200/.

-----

*Desenvolvido por [Tarcísio Bogo](https://www.google.com/search?q=https://www.linkedin.com/in/tarcisio-bogo/)* 



***
