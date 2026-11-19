# 🌾 Marketplace Rural: Agricultura Familiar
> **CETI Malaquias Ribeiro Damasceno** — São Lourenço do Piauí, PI  
> **Curso Técnico em Análise e Desenvolvimento de Sistemas**  
> **Projeto Integrador – Trabalho de Campo Orientado (TCO)**  
> **Professor Orientador:** Jean de Santana Souza  
> **Grupo:** Ana Isabel (6 integrantes)

---

## 📋 Sobre a Plataforma

O **Marketplace Rural** é uma plataforma web criada para conectar agricultores familiares de São Lourenço do Piauí e região diretamente aos consumidores locais, eliminando atravessadores e intermediários que reduzem a renda de quem produz no campo.

### ✨ Principais Funcionalidades
- 🛒 **Catálogo Público com Busca e Filtros:** Pesquisa por nome, filtragem por categorias (hortaliças, frutas, laticínios, artesanato) e ordenação por preço e novidades (**RF03, RF04**).
- 🧺 **Carrinho de Compras Inteligente (Cesta da Roça):** Adicione múltiplos itens, ajuste quantidades (+/-), calcule subtotais e envie pedidos agrupados diretamente para o WhatsApp de cada produtor familiar com cálculo automático.
- 📱 **Contato Direto via WhatsApp:** Botão com mensagem pronta e personalizada com o nome do produto para negociação direta com o produtor (**RF05**).
- 👨‍🌾 **Painel do Produtor:** Cadastro e login seguro com e-mail e senha, cadastro de produtos com foto, preço, unidade, edição, exclusão e controle de estoque (**RF01, RF02**).
- 👤 **Página de Perfil do Produtor:** Apresentação da família/produtor, localização e lista exclusiva de seus produtos (**RF06**).
- 🛡️ **Painel Administrativo:** Moderação e controle para aprovar ou bloquear produtores e produtos (**RF07**).
- ❤️ **Favoritos:** O consumidor pode salvar produtos favoritos para consultar a qualquer momento (**RF08**).
- 🌱 **Modo Demonstração Híbrido:** Permite navegar e testar 100% da plataforma imediatamente no navegador com dados da comunidade rural de São Lourenço do Piauí, com ou sem o Supabase conectado.
- 📱 **Design Responsivo (Mobile-First):** Otimizado especialmente para uso em smartphones com gaveta lateral e botão flutuante (**RNF01**).

---

## 🚀 Guia de Hospedagem: GitHub Pages & Supabase

A plataforma foi construída no modelo **Jamstack / SPA (Single Page Application)**, dispensando servidores backend pesados. Todo o frontend roda gratuitamente no **GitHub Pages** e todo o banco de dados, autenticação e upload de imagens rodam no **Supabase**.

---

### 1️⃣ Configuração do Banco de Dados no Supabase (Gratuito)

1. Acesse **[supabase.com](https://supabase.com)** e crie uma conta gratuita.
2. Clique no botão **"New Project"**.
3. Defina um nome para o projeto (exemplo: `marketplace-rural-sao-lourenco`) e uma senha segura para o banco.
4. Escolha a região mais próxima (ex: *South America - São Paulo*).
5. Aguarde o projeto ser provisionado (~1 a 2 minutos).

#### Executando o Script do Banco:
1. No menu lateral esquerdo do Supabase, clique em **SQL Editor** (ícone `>_` ou de banco de dados).
2. Clique em **"+ New query"**.
3. Abra o arquivo [`schema.sql`](./schema.sql) deste repositório, copie todo o seu conteúdo e cole no editor do Supabase.
4. Clique no botão **"Run"** (▶️) no canto inferior direito.
5. Verifique a mensagem de sucesso (`Success. No rows returned`). O script já cria as tabelas (`produtores`, `categorias`, `produtos`), políticas de segurança RLS (LGPD), bucket de fotos no Storage e produtos de exemplo de São Lourenço do Piauí!

#### Obtendo as Chaves de Acesso:
1. No menu lateral esquerdo do Supabase, clique em **Project Settings** (ícone de engrenagem) e depois em **API**.
2. Copie os dois valores:
   - **Project URL** (ex: `https://xyzcompany.supabase.co`)
   - **anon public key** (chave longa que inicia com `eyJ...`)
3. Abra o arquivo [`config.js`](./config.js) no seu projeto e cole os valores:
   ```javascript
   const SUPABASE_CONFIG = {
     url: 'https://SEU_PROJETO.supabase.co', // Cole sua Project URL aqui
     key: 'SUA_ANON_KEY_AQUI',               // Cole sua anon public key aqui
   };
   ```

---

### 2️⃣ Hospedagem Gratuita no GitHub Pages

#### Opção A: Publicando via Git no Terminal
Caso tenha o Git instalado na sua máquina:
```bash
# Inicializar o repositório
git init
git add .
git commit -m "feat: plataforma Marketplace Rural completa"
git branch -M main

# Conectar ao seu repositório no GitHub
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git push -u origin main
```

#### Opção B: Enviando diretamente pelo site do GitHub
1. Crie um novo repositório em [github.com/new](https://github.com/new).
2. Arraste e solte todos os arquivos da pasta para a página do repositório (`index.html`, `style.css`, `app.js`, `config.js`, `schema.sql`, pasta `.github`, etc.).
3. Clique em **Commit changes**.

#### Ativando o GitHub Pages:
1. No seu repositório no GitHub, clique na aba **Settings** (Configurações).
2. No menu lateral esquerdo, clique em **Pages**.
3. Em **Build and deployment > Source**, selecione:
   - **GitHub Actions** (recomendado, pois o arquivo [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) já está pronto para deploy automático);
   - OU selecione **Deploy from a branch** e escolha a branch `main` e a pasta `/ (root)`.
4. Em instantes, o GitHub Pages fornecerá o link público do seu site:
   `https://SEU_USUARIO.github.io/SEU_REPOSITORIO/`

---

### 3️⃣ Autorizando o Domínio no Supabase (Auth Redirect URLs)

Para que o login e cadastro de produtores funcionem no GitHub Pages sem bloqueio de segurança:
1. No painel do Supabase, vá em **Authentication > URL Configuration**.
2. No campo **Site URL**, informe a URL do seu GitHub Pages:
   `https://SEU_USUARIO.github.io/SEU_REPOSITORIO/`
3. Em **Redirect URLs**, clique em **Add URL** e adicione o mesmo endereço.
4. Clique em **Save**.

---

## 🧪 Casos de Teste do Projeto (Quadro 1 - TCO)

| ID | Funcionalidade | Passos de Teste | Resultado Esperado | Status |
|:---:|:---|:---|:---|:---:|
| **T01** | Cadastro de produtor | Preencher nome, WhatsApp, e-mail e senha no formulário | Conta de produtor criada com sucesso | ✅ Aprovado |
| **T02** | E-mail duplicado | Tentar cadastrar novo produtor com e-mail já existente | Sistema exibe mensagem de erro e recusa | ✅ Aprovado |
| **T03** | Login produtor / admin | Informar e-mail e senha válidos ou inválidos | Acesso liberado ao painel ou mensagem de erro | ✅ Aprovado |
| **T04** | Cadastro de produto | Informar nome, preço, unidade, categoria e foto | Produto é salvo e aparece imediatamente no catálogo | ✅ Aprovado |
| **T05** | Preço inválido | Tentar cadastrar produto com preço 0 ou negativo | Sistema recusa o valor e exige preço positivo | ✅ Aprovado |
| **T06** | Busca e filtros | Digitar no campo de busca e clicar nas categorias | Catálogo filtra instantaneamente os produtos | ✅ Aprovado |
| **T07** | Botão WhatsApp | Clicar em "Contatar via WhatsApp" no card do produto | Abre o WhatsApp com mensagem pré-preenchida | ✅ Aprovado |
| **T08** | Responsividade | Abrir a página no celular ou simulador responsivo | Interface adapta-se à tela com menu hambúrguer | ✅ Aprovado |
| **T09** | Bloqueio de produtor | No painel administrativo, alterar produtor para "bloqueado" | Produtos do produtor deixam de aparecer no catálogo | ✅ Aprovado |
| **T10** | Carrinho de Compras | Adicionar produtos, alterar quantidades e enviar pedido | Cesta calcula subtotais e envia pedido via WhatsApp | ✅ Aprovado |

---

## 🏛️ Equipe e Créditos Acadêmicos
- **Instituição:** CETI Malaquias Ribeiro Damasceno
- **Local:** São Lourenço do Piauí – PI
- **Orientação:** Prof. Jean de Santana Souza
- **Ano Letivo:** 2026
