/* ==========================================================
   CART.JS
   ----------------------------------------------------------
   Estado do carrinho + cálculo de preços.
   O carrinho guarda sabores individuais + quantidades.
   Combos são tratados como "itens" virtuais: ao adicionar um
   combo, cada sabor do combo vira uma linha no carrinho.
   ========================================================== */

const Cart = (function() {
  // state: Map<flavorId, qtd>
  let items = new Map();
  let feijao = false;

  // Eventos — qualquer parte da UI escuta e se re-renderiza
  const listeners = new Set();
  function notify() {
    saveToStorage();
    listeners.forEach(fn => fn());
  }
  function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

  /* --- CRUD --- */
  function add(flavorId, qtd = 1) {
    const cur = items.get(flavorId) || 0;
    items.set(flavorId, cur + qtd);
    notify();
  }
  function setQty(flavorId, qtd) {
    if (qtd <= 0) items.delete(flavorId);
    else items.set(flavorId, qtd);
    notify();
  }
  function remove(flavorId) {
    items.delete(flavorId);
    notify();
  }
  function clear() {
    items.clear();
    notify();
  }
  function getQty(flavorId) { return items.get(flavorId) || 0; }
  function getAll() { return new Map(items); }
  function setFeijao(val) { feijao = !!val; notify(); }
  function getFeijao() { return feijao; }
  function getTotalItems() {
    let total = 0;
    items.forEach(q => total += q);
    return total;
  }

  /* --- Substituir tudo (usado ao adicionar combo pronto) --- */
  function replaceWith(combo) {
    items.clear();
    combo.itens.forEach(({ flavorId, qtd }) => {
      if (qtd > 0) items.set(flavorId, (items.get(flavorId) || 0) + qtd);
    });
    notify();
  }

  /* --- Cálculo de preço ---
     Regras:
     - Total de marmitas: soma das quantidades
     - Peixes: cada unidade tem +R$5 sobre o preço unitário base
     - Faixas de combo:
         20+ marmitas → combo20 (R$260) — peixes adicionam R$5 cada
         10-19        → combo10 (R$180) — peixes adicionam R$5 cada
         <10          → avulso R$19 + R$5 para peixes
  */
  function calculate() {
    let totalMarmitas = 0;
    let qtdPeixe = 0;
    const detalhes = [];

    // Detecta se tem itens low carb no carrinho
    let temLowCarb = false;
    items.forEach((qtd, flavorId) => {
      const f = findFlavor(flavorId);
      if (!f) return;
      totalMarmitas += qtd;
      if (isPeixe(flavorId)) qtdPeixe += qtd;
      if (f.categoria === 'lowcarb') temLowCarb = true;
      detalhes.push({ flavor: f, qtd });
    });

    let subtotal = 0;
    let precoBase = 0;
    let faixa = 'avulso';

    // REGRA LOW CARB: só aceita combo de 20 marmitas por R$300
    // Se tem low carb, preço é sempre R$300 + acréscimo peixe (marmitas extras pelo unitário)
    if (temLowCarb) {
      if (totalMarmitas >= 20) {
        const extras = totalMarmitas - 20;
        precoBase = 300.00 + extras * (300.00 / 20);
      } else {
        // Ainda não fechou o combo — mostra preço projetado de R$300 como referência
        precoBase = 300.00;
      }
      faixa = 'combo20lowcarb';
    } else if (totalMarmitas >= 30) {
      const grupos30 = Math.floor(totalMarmitas / 30);
      const resto = totalMarmitas % 30;
      const precoGrupo30 = CONFIG.precos.combo30;
      if (resto === 0) {
        precoBase = grupos30 * precoGrupo30;
      } else if (resto >= 20) {
        precoBase = grupos30 * precoGrupo30 + CONFIG.precos.combo20;
      } else if (resto >= 10) {
        precoBase = grupos30 * precoGrupo30 + CONFIG.precos.combo10;
      } else if (resto >= 5) {
        precoBase = grupos30 * precoGrupo30 + CONFIG.precos.combo5;
      } else {
        const unitCombo = precoGrupo30 / 30;
        precoBase = grupos30 * precoGrupo30 + resto * unitCombo;
      }
      faixa = 'combo30';
    } else if (totalMarmitas >= 20) {
      const resto = totalMarmitas - 20;
      const precoGrupo20 = CONFIG.precos.combo20;
      if (resto === 0) {
        precoBase = precoGrupo20;
      } else if (resto >= 5) {
        precoBase = precoGrupo20 + CONFIG.precos.combo5;
      } else {
        const unitCombo = precoGrupo20 / 20;
        precoBase = precoGrupo20 + resto * unitCombo;
      }
      faixa = 'combo20';
    } else if (totalMarmitas >= 10) {
      precoBase = CONFIG.precos.combo10;
      if (totalMarmitas > 10) {
        const unitCombo10 = CONFIG.precos.combo10 / 10;
        precoBase += (totalMarmitas - 10) * unitCombo10;
      }
      faixa = 'combo10';
    } else if (totalMarmitas >= 5) {
      precoBase = CONFIG.precos.combo5;
      if (totalMarmitas > 5) {
        const unitCombo5 = CONFIG.precos.combo5 / 5;
        precoBase += (totalMarmitas - 5) * unitCombo5;
      }
      faixa = 'combo5';
    } else {
      precoBase = totalMarmitas * CONFIG.precos.unitario;
      faixa = 'avulso';
    }

    // Acréscimo do peixe (sempre aplicado)
    const acrescimoPeixe = qtdPeixe * CONFIG.precos.acrescimoPeixe;
    // Acréscimo do feijão (R$20 fixo por pedido, se solicitado)
    const acrescimoFeijao = feijao ? CONFIG.precos.acrescimoFeijao : 0;
    subtotal = precoBase + acrescimoPeixe + acrescimoFeijao;

    // Valor "de" (sem combo) — pra mostrar economia
    const valorSemCombo = totalMarmitas * CONFIG.precos.unitario + acrescimoPeixe;
    const economia = Math.max(0, valorSemCombo - subtotal);

    return {
      totalMarmitas,
      qtdPeixe,
      precoBase,
      acrescimoPeixe,
      acrescimoFeijao,
      feijao,
      subtotal,
      valorSemCombo,
      economia,
      faixa,
      detalhes,
      temLowCarb,
      lowCarbIncompleto: temLowCarb && totalMarmitas < 20,
      precoMedio: totalMarmitas > 0 ? subtotal / totalMarmitas : 0,
    };
  }

  /* --- Aplicar ajuste de pagamento ao total --- */
  function applyPaymentAdjustment(subtotal, paymentKey) {
    const p = CONFIG.pagamento[paymentKey];
    if (!p || p.tipo === 'nenhum') return { total: subtotal, ajuste: 0, label: '' };
    const ajuste = subtotal * (p.percentual / 100);
    if (p.tipo === 'desconto') return { total: subtotal - ajuste, ajuste: -ajuste, label: `Desconto (${p.label})` };
    if (p.tipo === 'acrescimo') return { total: subtotal + ajuste, ajuste: +ajuste, label: `Acréscimo (${p.label})` };
    return { total: subtotal, ajuste: 0, label: '' };
  }

  /* --- Persistência em localStorage --- */
  function saveToStorage() {
    try {
      const obj = Object.fromEntries(items);
      localStorage.setItem('ss_cart', JSON.stringify(obj));
      localStorage.setItem('ss_feijao', feijao ? '1' : '0');
    } catch (_) {}
  }
  function loadFromStorage() {
    try {
      const raw = localStorage.getItem('ss_cart');
      if (!raw) return;
      const obj = JSON.parse(raw);
      items = new Map(Object.entries(obj).map(([k, v]) => [k, Number(v)]));
      feijao = localStorage.getItem('ss_feijao') === '1';
    } catch (_) {}
  }

  // Inicia carregando do storage
  loadFromStorage();

  return {
    add, remove, setQty, clear, getQty, getAll, getTotalItems,
    replaceWith, calculate, applyPaymentAdjustment, subscribe,
    setFeijao, getFeijao,
  };
})();
