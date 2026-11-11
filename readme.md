# 🍲 Só Sabor — Sistema de Vendas de Marmitas

Sistema completo de vendas de marmitas desenvolvido com **Flask** e banco de dados, incluindo **painel administrativo** para gerenciamento do catálogo.

## 🚀 Características

- ✅ **Frontend moderno** mantendo o visual original da Só Sabor
- ✅ **Backend em Flask** com arquitetura profissional
- ✅ **Banco de dados** SQLite (dev) / PostgreSQL (produção)
- ✅ **Painel Administrativo** completo para gerenciar marmitas
- ✅ **Upload de imagens** com validação e segurança
- ✅ **Sistema de categorias** (Frango, Carne, Porco, Peixe, Low Carb, Outros)
- ✅ **Carrinho de compras** funcional
- ✅ **Checkout via WhatsApp** integrado
- ✅ **Totalmente responsivo**

## 📁 Estrutura do projeto

```
so-sabor REFATORADO/
├── app.py                 # Aplicação Flask principal
├── models.py              # Modelos do banco de dados (SQLAlchemy)
├── catalog_seed.py        # Catálogo inicial (30 marmitas)
├── requirements.txt       # Dependências Python
├── .env.example          # Exemplo de configuração
├── .gitignore            # Arquivos ignorados pelo Git
│
├── templates/            # Templates HTML (Jinja2)
│   ├── index.html        # Página principal do site
│   ├── admin_login.html  # Login do painel admin
│   └── admin_painel.html # Painel administrativo
│
├── static/               # Arquivos estáticos
│   ├── css/             # Estilos CSS originais
│   ├── js/              # JavaScript do frontend
│   ├── images/          # Imagens do site
│   └── uploads/         # Imagens enviadas via admin (criado automaticamente)
│
├── instance/            # Banco de dados SQLite (criado automaticamente)
│   └── so_sabor.db
│
└── venv/                # Ambiente virtual Python (após instalação)
```

## 📋 Pré-requisitos

- Python 3.8 ou superior
- pip (gerenciador de pacotes Python)

## 🔧 Instalação

1. **Navegue até o diretório do projeto:**
```bash
cd "C:\Users\rafin\Desktop\VSCode\Site Sabor\so-sabor REFATORADO"
```

2. **Crie um ambiente virtual:**
```bash
python -m venv venv
```

3. **Ative o ambiente virtual:**

Windows (PowerShell):
```powershell
.\venv\Scripts\Activate.ps1
```

Windows (CMD):
```cmd
venv\Scripts\activate.bat
```

4. **Instale as dependências:**
```bash
pip install -r requirements.txt
```

5. **Configure as variáveis de ambiente:**
```bash
# Copie o arquivo de exemplo
copy .env.example .env

# Edite o .env e configure:
# - SECRET_KEY: gere uma chave aleatória forte
# - ADMIN_PASSWORD: senha para acessar o painel (padrão: sosaboradmin)
```

## ▶️ Executando o Projeto

```bash
# Ative o ambiente virtual
.\venv\Scripts\Activate.ps1

# Execute a aplicação
python app.py
```

Acesse: **http://127.0.0.1:5000**

## 🔐 Painel Administrativo

### Acesso
- URL: **http://127.0.0.1:5000/admin**
- Senha padrão: `sosaboradmin` (altere no `.env`)

### Funcionalidades
- ✅ Visualizar estatísticas do catálogo
- ✅ Criar novas marmitas (nome, descrição, imagem, categoria)
- ✅ Editar marmitas existentes
- ✅ Excluir marmitas
- ✅ Ativar/Desativar disponibilidade
- ✅ Upload de imagens com validação automática (JPG, PNG, WEBP, GIF)
- ✅ Interface moderna e responsiva

## 🗄️ Banco de Dados

### SQLite (Padrão)
O projeto usa SQLite por padrão, criando automaticamente `instance/so_sabor.db`.

### PostgreSQL (Produção)
Para usar PostgreSQL, configure no `.env`:
```env
DATABASE_URL=postgresql://usuario:senha@host:5432/so_sabor
```

### Modelo de Dados (Tabela: marmitas)
- `id` - Chave primária
- `slug` - Identificador único para URLs
- `nome` - Nome da marmita
- `descricao` - Descrição completa
- `imagem` - Caminho da imagem
- `categoria` - Categoria (frango, carne, porco, peixe, lowcarb, outros)
- `disponivel` - Se está disponível para venda
- `criado_em` - Data de criação
- `atualizado_em` - Data da última atualização

## 📱 API Endpoints

### Frontend
- `GET /` - Página principal
- `GET /api/marmitas` - Lista todas as marmitas (JSON)

### Administrativo
- `GET /admin` - Login do painel
- `POST /admin/login` - Autenticação
- `GET /admin/painel` - Dashboard administrativo
- `POST /admin/marmitas` - Criar nova marmita
- `GET /admin/marmitas/<id>/editar` - Formulário de edição
- `POST /admin/marmitas/<id>` - Atualizar marmita
- `POST /admin/marmitas/<id>/excluir` - Excluir marmita
- `POST /admin/logout` - Sair do painel

## ⚙️ Como editar

### Trocar telefone, chave PIX, preços
Edite o arquivo `static/js/config.js`:
- `loja.whatsapp` — número com DDI (ex: `5531973583783`)
- `pix.chave` — chave PIX
- `precos.*` — valores de cada combo e marmita avulsa

### Adicionar/editar categorias
As categorias estão definidas em `app.py` nas constantes `CATEGORIES` e `CATEGORY_LABELS`.

## 🎨 Frontend

O frontend mantém o design original da Só Sabor:
- Interface limpa e profissional
- Cores da identidade visual (verde #285430, creme #fff9ee, laranja #ed8a2f)
- Sistema de filtros por categoria
- Carrinho de compras interativo
- Checkout direto via WhatsApp

## 🔒 Segurança

- ✅ Proteção CSRF em todos os formulários
- ✅ Validação de uploads (tipo MIME e extensão)
- ✅ Senhas com hash (Werkzeug)
- ✅ Proteção contra SQL Injection (SQLAlchemy ORM)
- ✅ Limite de tamanho de upload (5MB)
- ✅ Sanitização de nomes de arquivo

## 🛠️ Tecnologias

### Backend
- Flask 3.0+ - Framework web
- Flask-SQLAlchemy - ORM
- Python-dotenv - Variáveis de ambiente
- Werkzeug - Segurança e uploads
- Gunicorn - Servidor WSGI (produção)
- Psycopg - Driver PostgreSQL

### Frontend
- HTML5 com templates Jinja2
- CSS3 customizado
- JavaScript vanilla
- Font Awesome (ícones)

## 📝 Notas

1. **Catálogo Inicial**: Na primeira execução, 30 marmitas são cadastradas automaticamente
2. **Imagens**: Imagens padrão em `static/images/`, uploads em `static/uploads/`
3. **Segurança**: Altere `SECRET_KEY` e `ADMIN_PASSWORD` antes de publicar
4. **WhatsApp**: Configure o número em `static/js/config.js`

## 🤝 Desenvolvimento

Projeto refatorado do "montae-burguer-REFATORADO", adaptado para vendas de marmitas com painel administrativo completo.

---

**Desenvolvido com ❤️ para Só Sabor Marmitas** | Sistema completo Flask + SQLAlchemy + Admin Panel
