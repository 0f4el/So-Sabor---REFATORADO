import os
import re
import secrets
import unicodedata
from functools import wraps
from pathlib import Path
from uuid import uuid4

from dotenv import load_dotenv
from flask import Flask, jsonify, redirect, render_template, request, session, url_for
from werkzeug.exceptions import RequestEntityTooLarge
from werkzeug.security import check_password_hash
from werkzeug.utils import secure_filename

from catalog_seed import CATALOGO_INICIAL
from models import Marmita, db


BASE_DIR = Path(__file__).resolve().parent
INSTANCE_DIR = BASE_DIR / "instance"
STATIC_DIR = BASE_DIR / "static"
UPLOAD_DIR = STATIC_DIR / "uploads"
INSTANCE_DIR.mkdir(exist_ok=True)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

load_dotenv(BASE_DIR / ".env")

app = Flask(__name__, instance_path=str(INSTANCE_DIR))
app.config.update(
    SECRET_KEY=os.getenv("SECRET_KEY", "altere-esta-chave-em-producao"),
    SQLALCHEMY_TRACK_MODIFICATIONS=False,
    MAX_CONTENT_LENGTH=5 * 1024 * 1024,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=os.getenv("SESSION_COOKIE_SECURE", "false").lower() == "true",
)

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"sqlite:///{(INSTANCE_DIR / 'so_sabor.db').as_posix()}",
)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
# Garante compatibilidade caso a URL venha sem especificar o driver
if DATABASE_URL.startswith("postgresql://") and not DATABASE_URL.startswith("postgresql+"):
    # SQLAlchemy usará psycopg2 ou psycopg instalado
    pass

app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_pre_ping": True,
    "pool_recycle": 300,
}

# Em produção, defina ADMIN_PASSWORD como senha forte ou hash Werkzeug no .env.
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "sosaboradmin")
ALLOWED_IMAGE_EXTENSIONS = {"jpg", "jpeg", "png", "webp", "gif"}
CATEGORIES = ("frango", "carne", "porco", "peixe", "lowcarb", "outros")
CATEGORY_LABELS = {
    "frango": "Frango",
    "carne": "Carne",
    "porco": "Porco",
    "peixe": "Peixe",
    "lowcarb": "Low Carb",
    "outros": "Outros",
}

db.init_app(app)


def slugify(value):
    normalized = unicodedata.normalize("NFKD", value)
    ascii_value = normalized.encode("ascii", "ignore").decode("ascii").lower()
    slug = re.sub(r"[^a-z0-9]+", "-", ascii_value).strip("-")
    return slug or "marmita"


def unique_slug(name, current_id=None):
    base = slugify(name)
    slug = base
    suffix = 2
    while True:
        query = Marmita.query.filter_by(slug=slug)
        if current_id is not None:
            query = query.filter(Marmita.id != current_id)
        if not query.first():
            return slug
        slug = f"{base}-{suffix}"
        suffix += 1


def allowed_image(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_IMAGE_EXTENSIONS


def is_supported_image(upload):
    """Valida as assinaturas dos formatos aceitos sem dependência externa."""
    signature = upload.stream.read(16)
    upload.stream.seek(0)
    return (
        signature.startswith(b"\xff\xd8\xff")
        or signature.startswith(b"\x89PNG\r\n\x1a\n")
        or signature.startswith((b"GIF87a", b"GIF89a"))
        or (signature.startswith(b"RIFF") and signature[8:12] == b"WEBP")
    )


def save_image(upload):
    if not upload or not upload.filename:
        return None
    if not allowed_image(upload.filename) or not is_supported_image(upload):
        raise ValueError("Envie uma imagem válida nos formatos JPG, JPEG, PNG, WEBP ou GIF.")

    extension = secure_filename(upload.filename).rsplit(".", 1)[1].lower()
    stored_name = f"{uuid4().hex}.{extension}"
    upload.save(UPLOAD_DIR / stored_name)
    return f"uploads/{stored_name}"


def remove_image(image_path):
    if image_path and image_path.startswith("uploads/"):
        file_path = STATIC_DIR / image_path
        if file_path.is_file():
            file_path.unlink()


def validate_marmita_form(form):
    nome = (form.get("nome") or "").strip()
    descricao = (form.get("descricao") or "").strip()
    categoria = (form.get("categoria") or "outros").strip().lower()
    raw_estoque = form.get("estoque")

    if not 2 <= len(nome) <= 120:
        raise ValueError("O nome deve ter entre 2 e 120 caracteres.")
    if not 3 <= len(descricao) <= 2000:
        raise ValueError("A descrição deve ter entre 3 e 2.000 caracteres.")
    if categoria not in CATEGORIES:
        raise ValueError("Selecione uma categoria válida.")

    try:
        estoque = int(raw_estoque) if raw_estoque is not None and str(raw_estoque).strip() != "" else 0
        if estoque < 0:
            raise ValueError("O estoque não pode ser negativo.")
    except (ValueError, TypeError):
        raise ValueError("Informe um valor numérico válido para o estoque.")

    return nome, descricao, categoria, estoque


def csrf_token():
    token = session.get("csrf_token")
    if not token:
        token = secrets.token_urlsafe(32)
        session["csrf_token"] = token
    return token


def validar_csrf():
    token = request.form.get("csrf_token", "")
    return bool(token) and secrets.compare_digest(token, session.get("csrf_token", ""))


def senha_admin_valida(password):
    if ADMIN_PASSWORD.startswith(("pbkdf2:", "scrypt:")):
        return check_password_hash(ADMIN_PASSWORD, password)
    return secrets.compare_digest(password, ADMIN_PASSWORD)


def admin_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if not session.get("admin"):
            return redirect(url_for("admin_login"))
        return view(*args, **kwargs)

    return wrapped


def render_admin(*, editar=None, erro=None, status=200, form_data=None):
    return render_template(
        "admin_painel.html",
        marmitas=Marmita.query.order_by(Marmita.nome.asc()).all(),
        editar=editar,
        erro=erro,
        sucesso=request.args.get("sucesso"),
        categorias=CATEGORIES,
        category_labels=CATEGORY_LABELS,
        form_data=form_data or {},
    ), status


@app.context_processor
def inject_template_helpers():
    return {"csrf_token": csrf_token}


@app.errorhandler(RequestEntityTooLarge)
def handle_large_upload(_error):
    return "O arquivo enviado excede o limite de 5 MB.", 413


@app.get("/")
def home():
    return render_template("index.html")


@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "app": "Só Sabor"})


@app.get("/api/init-db")
def init_db_manual():
    """Rota utilitária para testar, atualizar colunas e forçar a criação das tabelas."""
    try:
        db.create_all()
        # Adiciona coluna estoque se a tabela já existia sem ela
        with db.engine.connect() as conn:
            conn.execute(db.text("ALTER TABLE marmitas ADD COLUMN IF NOT EXISTS estoque INTEGER DEFAULT 10;"))
            conn.execute(db.text("UPDATE marmitas SET disponivel = FALSE WHERE estoque <= 0;"))
            conn.commit()

        seed_catalog()
        total = Marmita.query.count()
        return jsonify({"status": "sucesso", "mensagem": "Tabelas e coluna de estoque verificadas com sucesso!", "total_marmitas": total})
    except Exception as e:
        import traceback
        return jsonify({"status": "erro", "detalhes": str(e), "traceback": traceback.format_exc()}), 500



@app.get("/api/marmitas")
def listar_marmitas_api():
    marmitas = Marmita.query.filter_by(disponivel=True).order_by(Marmita.nome.asc()).all()
    return jsonify({"marmitas": [marmita.to_dict() for marmita in marmitas]})


@app.get("/admin/login")
def admin_login():
    if session.get("admin"):
        return redirect(url_for("admin_painel"))
    return render_template("admin_login.html", erro=None)


@app.post("/admin/login")
def admin_login_post():
    if not validar_csrf():
        return render_template("admin_login.html", erro="Sessão expirada. Atualize a página e tente novamente."), 400
    if not senha_admin_valida(request.form.get("password", "")):
        return render_template("admin_login.html", erro="Senha incorreta."), 401

    session.clear()
    session["admin"] = True
    csrf_token()
    return redirect(url_for("admin_painel"))


@app.post("/admin/logout")
@admin_required
def admin_logout():
    if not validar_csrf():
        return "Requisição inválida.", 400
    session.clear()
    return redirect(url_for("admin_login"))


@app.get("/admin")
@admin_required
def admin_painel():
    return render_admin()


@app.post("/admin/marmitas")
@admin_required
def criar_marmita():
    if not validar_csrf():
        return "Requisição inválida.", 400

    image_path = None
    try:
        nome, descricao, categoria, estoque = validate_marmita_form(request.form)
        image_path = save_image(request.files.get("imagem"))
        if not image_path:
            raise ValueError("Selecione uma imagem para a marmita.")

        # Se estoque for 0, marca automaticamente como indisponível
        disponivel_marcado = request.form.get("disponivel") == "on"
        disponivel_final = disponivel_marcado and (estoque > 0)

        db.session.add(
            Marmita(
                slug=unique_slug(nome),
                nome=nome,
                descricao=descricao,
                imagem=image_path,
                categoria=categoria,
                estoque=estoque,
                disponivel=disponivel_final,
            )
        )
        db.session.commit()
        return redirect(url_for("admin_painel", sucesso="Marmita cadastrada com sucesso."))
    except ValueError as error:
        db.session.rollback()
        remove_image(image_path)
        return render_admin(erro=str(error), status=400, form_data=request.form.to_dict())


@app.get("/admin/marmitas/<int:marmita_id>/editar")
@admin_required
def editar_marmita(marmita_id):
    return render_admin(editar=db.get_or_404(Marmita, marmita_id))


@app.post("/admin/marmitas/<int:marmita_id>")
@admin_required
def atualizar_marmita(marmita_id):
    if not validar_csrf():
        return "Requisição inválida.", 400

    marmita = db.get_or_404(Marmita, marmita_id)
    new_image = None
    try:
        nome, descricao, categoria, estoque = validate_marmita_form(request.form)
        new_image = save_image(request.files.get("imagem"))
        old_image = marmita.imagem

        marmita.nome = nome
        marmita.slug = unique_slug(nome, current_id=marmita.id)
        marmita.descricao = descricao
        marmita.categoria = categoria
        marmita.estoque = estoque
        
        # Se estoque for 0, fica indisponível automaticamente
        disponivel_marcado = request.form.get("disponivel") == "on"
        marmita.disponivel = disponivel_marcado and (estoque > 0)

        if new_image:
            marmita.imagem = new_image

        db.session.commit()
        if new_image:
            remove_image(old_image)
        return redirect(url_for("admin_painel", sucesso="Marmita atualizada com sucesso."))
    except ValueError as error:
        db.session.rollback()
        remove_image(new_image)
        return render_admin(
            editar=marmita,
            erro=str(error),
            status=400,
            form_data=request.form.to_dict(),
        )


@app.post("/admin/marmitas/<int:marmita_id>/excluir")
@admin_required
def excluir_marmita(marmita_id):
    if not validar_csrf():
        return "Requisição inválida.", 400

    marmita = db.get_or_404(Marmita, marmita_id)
    image_path = marmita.imagem
    db.session.delete(marmita)
    db.session.commit()
    remove_image(image_path)
    return redirect(url_for("admin_painel", sucesso="Marmita excluída com sucesso."))



def seed_catalog():
    """Cria o cardápio original apenas na primeira inicialização do banco."""
    if Marmita.query.first() is not None:
        return

    for nome, descricao, categoria, imagem in CATALOGO_INICIAL:
        db.session.add(
            Marmita(
                slug=unique_slug(nome),
                nome=nome,
                descricao=descricao,
                categoria=categoria,
                imagem=imagem,
                disponivel=True,
            )
        )
    db.session.commit()


try:
    with app.app_context():
        db.create_all()
        seed_catalog()
except Exception as e:
    import logging
    logging.exception(f"Erro ao inicializar o banco de dados: {e}")
    # Não derruba o app imediatamente caso o banco esteja indisponível temporariamente



if __name__ == "__main__":
    app.run(
        host=os.getenv("FLASK_HOST", "127.0.0.1"),
        port=int(os.getenv("FLASK_PORT", "5000")),
        debug=os.getenv("FLASK_DEBUG", "false").lower() == "true",
    )
