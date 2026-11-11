/* ==========================================================
   DATA.JS
   ----------------------------------------------------------
   Catálogo de sabores e combos.
   Cada item tem `id` único (usado no carrinho) e `imagem`
   (campo para futura imagem — substitua '' pelo caminho).
   ========================================================== */

/* --- SABORES --- */
const FLAVORS = [
  // FRANGO
  { id: 'f1', nome: 'Strogonoff de Frango', categoria: 'frango', descricao: 'Arroz branco e strogonoff cremoso de frango', imagem: '/static/images/strogonoff.jpeg' },
  { id: 'f2', nome: 'Sobrecoxa com Creme de Milho', categoria: 'frango', descricao: 'Arroz branco, sobrecoxa assada e creme de milho', imagem: '/static/images/sobrecoxa.jpeg' },
  { id: 'f3', nome: 'Penne ao Molho Branco com Frango', categoria: 'frango', descricao: 'Massa penne, frango desfiado e molho branco cremoso', imagem: '/static/images/penne-molho-branco.jpeg' },
  { id: 'f4', nome: 'Frango com Batata Doce', categoria: 'frango', descricao: 'Arroz branco, frango em cubos e batata doce', imagem: '/static/images/frango-batata-doce.jpeg' },
  { id: 'f5', nome: 'Frango com Mix de Legumes', categoria: 'frango', descricao: 'Arroz branco, frango + mix de legumes (cenoura, abobrinha e chuchu)', imagem: '/static/images/frango-mix-legumes.jpeg' },
  { id: 'f6', nome: 'Frango com Quiabo', categoria: 'frango', descricao: 'Arroz branco, coxa de frango com quiabo, angu cremoso e couve refogada', imagem: '/static/images/frango_com_quiabo.jpeg'},

  // CARNE
  { id: 'c1', nome: 'Carne Desfiada com Purê', categoria: 'carne', descricao: 'Arroz branco, purê de batata, carne desfiada', imagem: '/static/images/logo.jpeg' },
  { id: 'c2', nome: 'Carne de Panela com Mandioca', categoria: 'carne', descricao: 'Arroz branco, carne de panela com mandioca cozida.', imagem: '/static/images/carne-panela-mandioca.jpeg' },
  { id: 'c3', nome: 'Carne Moída com Purê de Moranga', categoria: 'carne', descricao: 'Arroz branco, purê de moranga e carne moída', imagem: '/static/images/carne-moida-moranga.jpeg' },
  { id: 'c4', nome: 'Carne Moída com Legumes', categoria: 'carne', descricao: 'Arroz branco, carne moída e mix de legumes (cenoura, abobrinha e chuchu)', imagem: '/static/images/carne-moida-legumes.jpeg' },
  { id: 'c5', nome: 'Macarrão a bolonhesa', categoria: 'carne', descricao: 'Macarrão a bolonhesa com carne moída e molho de tomate.', imagem: '/static/images/macarrao-a-bolonhesa.jpeg' },
  { id: 'c6', nome: 'Strogonoff de Carne', categoria: 'carne', descricao: 'Delicioso strogonoff de carne, preparado com um molho cremoso e acompanhado de arroz.', imagem: '/static/images/strogonoffcarne.jpeg' },

  // PORCO
  { id: 'p1', nome: 'Arroz da Chefe', categoria: 'porco', descricao: 'Bacon, linguiça calabresa, cenoura, milho e cebola', imagem: '/static/images/arroz-da-chefe.jpeg' },
  { id: 'p2', nome: 'Feijoada Light', categoria: 'porco', descricao: 'Pernil e linguiça calabresa', imagem: '/static/images/feijoada-light.jpeg' },
  { id: 'p3', nome: 'Tropeiro', categoria: 'porco', descricao: 'Arroz, tropeiro (feijão carioca, couve, pernil, calabresa + mix de farinhas especial da casa).', imagem: '/static/images/tropeiro.jpeg' },

  // PEIXE (com acréscimo)
  { id: 'x1', nome: 'Arroz com Moquequinha e Purê', categoria: 'peixe', descricao: 'Moquequinha cremosa com arroz e purê.', imagem: '/static/images/moquequinha-pure.jpeg' },
  { id: 'x2', nome: 'Isca de Peixe com Purê', categoria: 'peixe', descricao: 'Iscas de peixe empanadas com arroz e purê.', imagem: '/static/images/isca-peixe-pure.jpeg' },

  // LOW CARB — mesmas proteínas, mix de legumes no lugar do arroz
  { id: 'l1', nome: 'Low Carb · Strogonoff de Frango', categoria: 'lowcarb', descricao: 'Strogonoff de frango com mix de legumes (sem arroz).', imagem: '/static/images/logo.jpeg' },
  { id: 'l2', nome: 'Low Carb · Sobrecoxa com Creme de Milho', categoria: 'lowcarb', descricao: 'Sobrecoxa assada, creme de milho e mix de legumes.', imagem: '/static/images/logo.jpeg' },
  { id: 'l3', nome: 'Low Carb · Frango com Batata Doce', categoria: 'lowcarb', descricao: 'Frango grelhado, batata doce e mix de legumes (sem arroz).', imagem: '/static/images/logo.jpeg' },
  { id: 'l4', nome: 'Low Carb · Carne Desfiada', categoria: 'lowcarb', descricao: 'Carne desfiada temperada com purê e mix de legumes.', imagem: '/static/images/logo.jpeg' },
  { id: 'l5', nome: 'Low Carb · Carne de Panela', categoria: 'lowcarb', descricao: 'Carne de panela com mandioca e mix de legumes.', imagem: '/static/images/logo.jpeg' },
  { id: 'l6', nome: 'Low Carb · Carne Moída com Legumes', categoria: 'lowcarb', descricao: 'Carne moída temperada com mix de legumes frescos.', imagem: '/static/images/logo.jpeg' },
  { id: 'l8', nome: 'Low Carb · Feijoada Light', categoria: 'lowcarb', descricao: 'Feijoada leve com copa lombo e mix de legumes.', imagem: '/static/images/logo.jpeg' },
  { id: 'l9', nome: 'Low Carb · Tropeiro', categoria: 'lowcarb', descricao: 'Tropeiro (feijão carioca, couve, pernil e calabresa) com mix de legumes (sem arroz).', imagem: '/static/images/logo.jpeg' },
  // Opções low carb com peixe (acréscimo aplicado — ver helper isPeixe)
  { id: 'lx1', nome: 'Low Carb · Moquequinha', categoria: 'lowcarb', descricao: 'Moquequinha cremosa com mix de legumes (sem arroz).', imagem: '/static/images/logo.jpeg', peixe: true },
  { id: 'lx2', nome: 'Low Carb · Isca de Peixe', categoria: 'lowcarb', descricao: 'Iscas de peixe com purê e mix de legumes.', imagem: '/static/images/logo.jpeg', peixe: true },
];

/* --- COMBOS PRONTOS ---
   Montados automaticamente a partir dos sabores acima,
   mas o usuário pode alterar antes de finalizar. */
const COMBOS = [
  // --- COMBO 5 ---
  {
    id: 'combo-5-mix',
    tipo: 'combo5',
    destaque: false,
    titulo: 'Combo 5 Mix',
    descricao: 'Pra experimentar — 5 marmitas variadas entre carne, frango e porco.',
    qtd: 5,
    preco: 120.00,
    imagem: '/static/images/logo.jpeg',
    itens: [
      { flavorId: 'f2', qtd: 0 }, { flavorId: 'f4', qtd: 0 },
      { flavorId: 'c1', qtd: 0 },
      { flavorId: 'p1', qtd: 0 }, { flavorId: 'p2', qtd: 0 },
    ],
  },
  {
    id: 'combo-5-mix-peixe',
    tipo: 'combo5',
    destaque: false,
    titulo: 'Combo 5 Mix + Peixe',
    descricao: '5 marmitas variadas com 1 de peixe. Acréscimo já incluso.',
    qtd: 5,
    preco: 125.00,
    imagem: '/static/images/logo.jpeg',
    itens: [
      { flavorId: 'f1', qtd: 0 },
      { flavorId: 'c3', qtd: 0 },
      { flavorId: 'p1', qtd: 0 }, { flavorId: 'p2', qtd: 0 },
      { flavorId: 'x1', qtd: 0 },
    ],
  },

  {
    id: 'combo-20-mix',
    tipo: 'combo20',
    destaque: true,
    titulo: 'Combo 20 Mix',
    descricao: 'Nosso mais pedido — 20 marmitas variadas entre carne, frango e porco. Variedade pra semana inteira.',
    qtd: 20,
    preco: 260.00,
    imagem: '/static/images/logo.jpeg',
    // Distribuição automática: ~7 frango, 7 carne, 6 porco (complementa com outros se faltar)
    itens: [
      { flavorId: 'f1', qtd: 0 }, { flavorId: 'f2', qtd: 0 }, { flavorId: 'f4', qtd: 0 },
      { flavorId: 'c1', qtd: 0 }, { flavorId: 'c3', qtd: 0 }, { flavorId: 'c4', qtd: 0 },
      { flavorId: 'p1', qtd: 0 }, { flavorId: 'p2', qtd: 0 },
    ],
  },

  {
    id: 'combo-30-mix',
    tipo: 'combo30',
    destaque: false,
    titulo: 'Combo 30 Mix',
    descricao: 'Máxima economia e praticidade — 30 marmitas variadas entre carne, frango, porco e opções de peixe. Ideal para o mês todo.',
    qtd: 30,
    preco: 375.00,
    imagem: '/static/images/logo.jpeg',
    // Distribuição automática: ~7 frango, 7 carne, 6 porco (complementa com outros se faltar)
    itens: [
      { flavorId: 'f1', qtd: 0 }, { flavorId: 'f2', qtd: 0 }, { flavorId: 'f4', qtd: 0 },
      { flavorId: 'c1', qtd: 0 }, { flavorId: 'c3', qtd: 0 }, { flavorId: 'c4', qtd: 0 },
      { flavorId: 'p1', qtd: 0 }, { flavorId: 'p2', qtd: 0 },
      { flavorId: 'x1', qtd: 0 }, { flavorId: 'x2', qtd: 0 },
    ],
  },

  {
    id: 'combo-20-mix-peixe',
    tipo: 'combo20',
    destaque: false,
    titulo: 'Combo 20 Mix + Peixe',
    descricao: '20 marmitas variadas incluindo 4 de peixe (moquequinha e isca). Acréscimo do peixe já incluso.',
    qtd: 20,
    preco: 280.00,
    imagem: '/static/images/logo.jpeg',
    itens: [
      { flavorId: 'f1', qtd: 0 }, { flavorId: 'f3', qtd: 0 }, { flavorId: 'f5', qtd: 0 },
      { flavorId: 'c2', qtd: 0 }, { flavorId: 'c5', qtd: 0 }, { flavorId: 'c4', qtd: 0 },
      { flavorId: 'p1', qtd: 0 }, { flavorId: 'p2', qtd: 0 },
      { flavorId: 'x1', qtd: 0 }, { flavorId: 'x2', qtd: 0 },
    ],
  },
  {
    id: 'combo-10-mix',
    tipo: 'combo10',
    destaque: false,
    titulo: 'Combo 10 Mix',
    descricao: 'Perfeito pra semana — 10 marmitas variadas. Carne, frango e porco equilibrados.',
    qtd: 10,
    preco: 180.00,
    imagem: '/static/images/logo.jpeg',
    itens: [
      { flavorId: 'f2', qtd: 0 }, { flavorId: 'f4', qtd: 0 },
      { flavorId: 'c1', qtd: 0 }, { flavorId: 'c3', qtd: 0 },
      { flavorId: 'p1', qtd: 0 }, { flavorId: 'p2', qtd: 0 },
    ],
  },
  {
    id: 'combo-10-mix-peixe',
    tipo: 'combo10',
    destaque: false,
    titulo: 'Combo 10 Mix + Peixe',
    descricao: '10 marmitas variadas com 2 de peixe. Acréscimo já incluso.',
    qtd: 10,
    preco: 190.00,
    imagem: '/static/images/logo.jpeg',
    itens: [
      { flavorId: 'f1', qtd: 0 }, { flavorId: 'f5', qtd: 0 },
      { flavorId: 'c2', qtd: 0 }, { flavorId: 'c4', qtd: 0 },
      { flavorId: 'p1', qtd: 0 }, { flavorId: 'p2', qtd: 0 },
      { flavorId: 'x1', qtd: 0 }, { flavorId: 'x2', qtd: 0 },
    ],
  },
  {
    id: 'combo-20-carne',
    tipo: 'combo20carne',
    destaque: false,
    titulo: 'Combo 20 Só Carne',
    descricao: 'Pros amantes de carne — 20 marmitas exclusivamente de carne bovina.',
    qtd: 20,
    preco: 300.00,
    imagem: '/static/images/logo.jpeg',
    itens: [
      { flavorId: 'c1', qtd: 0 }, { flavorId: 'c2', qtd: 0 },
      { flavorId: 'c3', qtd: 0 }, { flavorId: 'c4', qtd: 0 },
      { flavorId: 'c5', qtd: 0 },
    ],
  },
  {
    id: 'combo-20-frango',
    tipo: 'combo20frango',
    destaque: false,
    titulo: 'Combo 20 Só Frango',
    descricao: '20 marmitas de frango variadas. Leve, saboroso e prático.',
    qtd: 20,
    preco: 280.00,
    imagem: '/static/images/logo.jpeg',
    itens: [
      { flavorId: 'f1', qtd: 0 }, { flavorId: 'f2', qtd: 0 },
      { flavorId: 'f3', qtd: 0 }, { flavorId: 'f4', qtd: 0 },
      { flavorId: 'f5', qtd: 0 },
    ],
  },

  // --- LOW CARB (20 marmitas sem arroz, mix de legumes no lugar) ---
  {
    id: 'combo-20-lowcarb',
    tipo: 'combo20lowcarb',
    destaque: false,
    titulo: 'Combo 20 Low Carb',
    descricao: '20 marmitas sem arroz — mix de legumes no lugar. Mesma variedade de proteínas (carne, frango e porco).',
    qtd: 20,
    preco: 300.00,
    imagem: '/static/images/logo.jpeg',
    itens: [
      { flavorId: 'l1', qtd: 0 }, { flavorId: 'l2', qtd: 0 }, { flavorId: 'l3', qtd: 0 },
      { flavorId: 'l4', qtd: 0 }, { flavorId: 'l5', qtd: 0 }, { flavorId: 'l6', qtd: 0 },
      { flavorId: 'l8', qtd: 0 }, { flavorId: 'l9', qtd: 0 },
    ],
  },
  {
    id: 'combo-20-lowcarb-peixe',
    tipo: 'combo20lowcarb',
    destaque: false,
    titulo: 'Combo 20 Low Carb + Peixe',
    descricao: '20 marmitas sem arroz com opções de peixe (acréscimo de R$5 por unidade de peixe já incluso).',
    qtd: 20,
    preco: 300.00,
    imagem: '/static/images/logo.jpeg',
    itens: [
      { flavorId: 'l1', qtd: 0 }, { flavorId: 'l2', qtd: 0 }, { flavorId: 'l3', qtd: 0 },
      { flavorId: 'l4', qtd: 0 }, { flavorId: 'l5', qtd: 0 }, { flavorId: 'l6', qtd: 0 },
      { flavorId: 'l8', qtd: 0 }, { flavorId: 'l9', qtd: 0 },
      { flavorId: 'lx1', qtd: 0 }, { flavorId: 'lx2', qtd: 0 },
    ],
  },
];

/* Helpers */
function findFlavor(id) {
  return FLAVORS.find(f => f.id === id);
}

function isPeixe(flavorId) {
  const f = findFlavor(flavorId);
  if (!f) return false;
  // Categoria peixe OU flag `peixe: true` (usado nos low carb de peixe)
  return f.categoria === 'peixe' || f.peixe === true;
}
