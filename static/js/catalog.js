/* ==========================================================
   CATÁLOGO DINÂMICO
   Carrega as marmitas cadastradas no Flask/SQLAlchemy.
   O catálogo local em data.js fica apenas como contingência
   caso a API esteja temporariamente indisponível.
   ========================================================== */

async function loadCatalog() {
  try {
    const response = await fetch('/api/marmitas', {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) throw new Error('Não foi possível carregar o catálogo.');

    const data = await response.json();
    if (!Array.isArray(data.marmitas)) throw new Error('Resposta de catálogo inválida.');

    FLAVORS.splice(0, FLAVORS.length, ...data.marmitas);
  } catch (error) {
    console.error(error);
    console.warn('Usando o catálogo local de contingência.');
  }
}
