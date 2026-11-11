from datetime import datetime, timezone

from flask import url_for
from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy()


def agora_utc():
    """Retorna a data atual em UTC para os registros persistidos."""
    return datetime.now(timezone.utc)


class Marmita(db.Model):
    """Produto exibido no catálogo público da Só Sabor."""

    __tablename__ = "marmitas"

    id = db.Column(db.Integer, primary_key=True)
    slug = db.Column(db.String(150), unique=True, nullable=False, index=True)
    nome = db.Column(db.String(120), nullable=False, index=True)
    descricao = db.Column(db.Text, nullable=False)
    imagem = db.Column(db.String(255), nullable=False)
    categoria = db.Column(db.String(30), nullable=False, default="outros", index=True)
    estoque = db.Column(db.Integer, nullable=False, default=10)
    disponivel = db.Column(db.Boolean, nullable=False, default=True, index=True)
    criado_em = db.Column(db.DateTime(timezone=True), nullable=False, default=agora_utc)
    atualizado_em = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=agora_utc,
        onupdate=agora_utc,
    )

    def to_dict(self):
        """Formato consumido pelo catálogo JavaScript e pelo painel."""
        return {
            "id": self.slug,
            "database_id": self.id,
            "nome": self.nome,
            "descricao": self.descricao,
            "imagem": url_for("static", filename=self.imagem),
            "categoria": self.categoria,
            "estoque": int(self.estoque) if self.estoque is not None else 0,
            "disponivel": bool(self.disponivel and (self.estoque is None or self.estoque > 0)),
            "criado_em": self.criado_em.isoformat() if self.criado_em else None,
            "atualizado_em": self.atualizado_em.isoformat() if self.atualizado_em else None,
        }
