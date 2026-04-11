# Personal.ai - Seu Personal Trainer Inteligente

Um aplicativo web moderno e intuitivo para gerenciamento de treinos de fitness, impulsionado por inteligência artificial. Desenvolvido com tecnologias de ponta para oferecer uma experiência personalizada e motivadora.

## 🚀 Sobre o Projeto

Personal.ai é uma plataforma completa de acompanhamento fitness que combina planejamento inteligente de treinos, rastreamento de progresso e insights gerados por IA. O app permite que usuários criem planos de treino personalizados baseados em modalidades como academia, treino em casa, corrida e futevôlei, com progressão automática em 3 meses.

### ✨ Funcionalidades Principais
- **Planejamento Semanal Inteligente**: IA gera planos otimizados com base na disponibilidade do usuário
- **Variação de Exercícios**: Sugestões de IA para manter a rotina fresca e motivadora
- **Rastreamento de Progresso**: Logs detalhados de treinos com métricas de desempenho
- **Insights com IA**: Análises personalizadas do progresso e dicas motivacionais
- **Calendário Visual**: Visualização mensal dos treinos realizados
- **Sincronização Multi-Dispositivo**: Dados salvos na nuvem via Firebase
- **Interface Responsiva**: Otimizada para mobile e desktop

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 19**: Framework JavaScript moderno para interfaces dinâmicas
- **Vite**: Build tool ultra-rápido para desenvolvimento e produção
- **Tailwind CSS**: Framework CSS utilitário para design responsivo
- **Lucide React**: Biblioteca de ícones vetoriais

### Backend & Infraestrutura
- **Firebase**: Autenticação, banco de dados Firestore e hospedagem
- **Google Gemini AI**: API de IA para geração de treinos e insights
- **Vercel**: Plataforma de deployment para CI/CD automático

### Desenvolvimento
- **ESLint**: Linting para código limpo e consistente
- **PostCSS**: Processamento de CSS com Autoprefixer
- **Git**: Controle de versão

## 📱 Como Usar

1. **Acesse**: [personal-ai.vercel.app](https://personal-ai.vercel.app) (exemplo)
2. **Login**: Use sua conta Google para autenticação segura
3. **Configure**: Defina sua disponibilidade semanal na aba "Plano"
4. **Treine**: Siga os treinos sugeridos e registre seu progresso
5. **Acompanhe**: Visualize evolução no calendário e histórico

## 🏗️ Como Foi Construído

Este projeto foi desenvolvido seguindo boas práticas modernas de desenvolvimento web:

### Arquitetura
- **Component-Based**: Estrutura modular com componentes React reutilizáveis
- **State Management**: Gerenciamento de estado local com hooks do React
- **Real-Time Sync**: Integração com Firestore para sincronização em tempo real
- **AI Integration**: Chamadas assíncronas para APIs de IA com tratamento de erros

### Processo de Desenvolvimento
1. **Planejamento**: Definição de requisitos e wireframes
2. **Setup Inicial**: Configuração do projeto com Vite e Firebase
3. **Autenticação**: Implementação de login com Google via Firebase Auth
4. **Core Features**: Desenvolvimento das funcionalidades principais (plano, treinos, logs)
5. **AI Integration**: Integração com Gemini API para funcionalidades inteligentes
6. **UI/UX**: Design responsivo e intuitivo com Tailwind CSS
7. **Testing & Deployment**: Testes manuais e deploy automatizado no Vercel

### Desafios Técnicos
- **Sincronização de Dados**: Garantia de consistência entre dispositivos usando Firestore
- **Integração com IA**: Tratamento de respostas assíncronas e fallbacks
- **Performance**: Otimização para carregamento rápido em dispositivos móveis
- **Segurança**: Proteção de chaves de API e regras de acesso no Firebase

## 🚀 Executando Localmente

### Pré-requisitos
- Node.js 18+
- Conta Google (para APIs)
- Projeto Firebase configurado

### Instalação
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/personal-ai.git
cd personal-ai

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com suas chaves

# Execute em modo desenvolvimento
npm run dev
```

### Configuração do Firebase
1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Habilite Authentication com Google Provider
3. Configure Firestore Database
4. Atualize as regras de segurança
5. Adicione as chaves no `.env`

## 📈 Roadmap
- [ ] Notificações push para lembretes de treino
- [ ] Integração com wearables (Apple Watch, Fitbit)
- [ ] Modo offline com sincronização
- [ ] Comunidade e compartilhamento de treinos
- [ ] Análise avançada com machine learning

## 🤝 Contribuição
Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

## 📄 Licença
Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

**Desenvolvido com ❤️ para ajudar pessoas a alcançarem seus objetivos de fitness de forma inteligente e sustentável.**
