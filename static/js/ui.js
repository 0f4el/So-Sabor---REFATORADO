/* ==========================================================
   UI.JS
   ----------------------------------------------------------
   Renderização dos combos, sabores, carrinho e modais.
   ========================================================== */

const UI = (function() {

  /* --- Helpers DOM --- */
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  /* --- RENDER: Combos prontos --- */
  function renderCombos() {
    const grid = $('#combosGrid');
    if (!grid) return;
    grid.innerHTML = COMBOS.map(combo => {
      const precoCalc = calcularPrecoCombo(combo);
      const unitario = precoCalc / combo.qtd;

      return `
        <article class="combo-card ${combo.destaque ? 'is-featured' : ''}">
          ${combo.destaque ? '<span class="combo-featured-tag">Mais pedido</span>' : ''}
          <div class="combo-image">
            <img src="${combo.imagem || '/static/images/logo.jpeg'}" alt="${combo.titulo}">
          </div>
          <div class="combo-body">
            <h3 class="combo-title">${combo.titulo}</h3>
            <p class="combo-desc">${combo.descricao}</p>


            <div class="combo-price-row">
              <span class="combo-qty">${combo.qtd} marmitas</span>
              <div style="text-align:right">
                <div class="combo-price">${fmt(precoCalc)}</div>
                <div class="combo-price-unit">≈ ${fmt(unitario)} por marmita</div>
              </div>
            </div>

            <div class="combo-actions">
              <button class="btn btn-primary" data-action="add-combo" data-combo-id="${combo.id}">
                Adicionar e editar
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Handler: veja mais / veja menos
    $$('[data-see-more]').forEach(btn => {
      btn.addEventListener('click', () => {
        const rest = btn.parentElement.querySelector('[data-flavors-rest]');
        if (!rest) return;
        const expanded = rest.classList.toggle('combo-flavors-list--hidden');
        // expanded === true agora significa "escondido", pois toggle retorna o novo estado
        if (expanded) {
          const totalOcultos = rest.children.length;
          btn.textContent = `Ver mais ${totalOcultos} opções`;
        } else {
          btn.textContent = 'Ver menos';
        }
      });
    });

    // click handlers
    $$('[data-action="add-combo"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.comboId;
        openCustomizeComboModal(id);
      });
    });
  }

  // Calcula preço de um combo já considerando peixes (se existirem no combo)
  function calcularPrecoCombo(combo) {
    if (combo.preco) {
      // preço fixo + acréscimo de peixes inclusos
      const qtdPeixe = combo.itens.reduce((acc, it) => {
        return acc + (isPeixe(it.flavorId) ? it.qtd : 0);
      }, 0);
      return combo.preco + qtdPeixe * CONFIG.precos.acrescimoPeixe;
    }
    // Combos sem preço fixo — calcula pelo total
    const temp = new Map();
    combo.itens.forEach(({ flavorId, qtd }) => temp.set(flavorId, qtd));
    let totalMarmitas = 0;
    let qtdPeixe = 0;
    temp.forEach((q, id) => {
      totalMarmitas += q;
      if (isPeixe(id)) qtdPeixe += q;
    });
    let base = 0;
    const refQtd = totalMarmitas > 0 ? totalMarmitas : (combo.qtd || 0);
    if (refQtd >= 20) base = CONFIG.precos.combo20;
    else if (refQtd >= 10) base = CONFIG.precos.combo10;
    else if (refQtd >= 5) base = CONFIG.precos.combo5;
    else base = refQtd * CONFIG.precos.unitario;
    return base + qtdPeixe * CONFIG.precos.acrescimoPeixe;
  }

  /* --- RENDER: Sabores no builder --- */
  function renderFlavors(filter = 'todos') {
    const grid = $('#flavorsGrid');
    if (!grid) return;

    grid.innerHTML = FLAVORS.map(flavor => {
      const qtd = Cart.getQty(flavor.id);
      const precoBase = CONFIG.precos.unitario;
      const acrescimo = isPeixe(flavor.id) ? CONFIG.precos.acrescimoPeixe : 0;
      const hidden = (filter !== 'todos' && filter !== flavor.categoria) ? 'is-hidden' : '';

      // Renderiza com <img> se tiver caminho de imagem, senão placeholder
      const imgHtml = flavor.imagem
        ? `<img src="${flavor.imagem}" alt="${flavor.nome}">`
        : '[ foto ]';

      return `
        <article class="flavor-card ${hidden}" data-category="${flavor.categoria}" data-flavor-id="${flavor.id}">
          <div class="flavor-image">
            <span class="flavor-category-tag cat-${flavor.categoria}">${flavor.categoria}</span>
            ${imgHtml}
          </div>
          <div class="flavor-body">
            <h3 class="flavor-name">${flavor.nome}</h3>
            <p class="flavor-desc">${flavor.descricao}</p>
            <div class="flavor-foot">
              <div class="flavor-price">
                ${fmt(precoBase)}${acrescimo ? ' <small>+R$5 peixe</small>' : ''}
              </div>
              <div class="qty-stepper" data-flavor-id="${flavor.id}">
                <button class="qty-btn" data-action="dec" aria-label="Diminuir" ${qtd === 0 ? 'disabled' : ''}>−</button>
                <span class="qty-display">${qtd}</span>
                <button class="qty-btn" data-action="inc" aria-label="Aumentar">+</button>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Event listeners nos steppers
    $$('#flavorsGrid .qty-stepper').forEach(stepper => {
      const flavorId = stepper.dataset.flavorId;
      stepper.querySelector('[data-action="inc"]').addEventListener('click', () => {
        Cart.setQty(flavorId, Cart.getQty(flavorId) + 1);
      });
      stepper.querySelector('[data-action="dec"]').addEventListener('click', () => {
        Cart.setQty(flavorId, Math.max(0, Cart.getQty(flavorId) - 1));
      });
    });
  }

  /* --- RENDER: Carrinho lateral --- */
  function renderCart() {
    const body = $('#cartBody');
    const foot = $('#cartFoot');
    const count = $('#cartCount');
    const calc = Cart.calculate();

    // contador no header
    count.textContent = calc.totalMarmitas;
    count.classList.toggle('is-zero', calc.totalMarmitas === 0);

    // Corpo vazio?
    if (calc.totalMarmitas === 0) {
      body.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/></svg>
          </div>
          <h4>Seu carrinho tá vazio</h4>
          <p>Adicione um combo pronto ou monte o seu com os sabores que preferir.</p>
        </div>
      `;
      foot.innerHTML = '';
      return;
    }

    // Progresso do combo
    const faltaCombo5  = Math.max(0, 5  - calc.totalMarmitas);
    const faltaCombo10 = Math.max(0, 10 - calc.totalMarmitas);
    const faltaCombo20 = Math.max(0, 20 - calc.totalMarmitas);
    const faltaCombo30 = Math.max(0, 30 - calc.totalMarmitas);
    let progressoInfo;

    // REGRA ESPECIAL LOW CARB — só aceita combo 20 (R$300)
    if (calc.temLowCarb) {
      if (calc.totalMarmitas < 20) {
        const pct = (calc.totalMarmitas / 20) * 100;
        progressoInfo = `
          <div class="cart-combo-progress cart-lowcarb-warn">
            <div class="cart-combo-progress-label">
              <span>⚠ Low Carb: pedido mínimo de <strong>20 marmitas</strong></span>
              <small>R$ 300,00</small>
            </div>
            <div class="cart-progress-bar"><div class="cart-progress-fill" style="width:${pct}%"></div></div>
            <div class="cart-lowcarb-hint">Faltam ${faltaCombo20} marmita(s) para fechar o combo Low Carb</div>
          </div>
        `;
      } else {
        progressoInfo = `
          <div class="cart-combo-progress is-complete">
            <div class="cart-combo-progress-label">
              <span>✓ Combo 20 Low Carb aplicado!</span>
            </div>
          </div>
        `;
      }
    } else if (calc.totalMarmitas < 5) {
      const pct = (calc.totalMarmitas / 5) * 100;
      progressoInfo = `
        <div class="cart-combo-progress">
          <div class="cart-combo-progress-label">
            <span>Falta ${faltaCombo5} pro Combo 5</span>
            <small>${fmt(CONFIG.precos.combo5)}</small>
          </div>
          <div class="cart-progress-bar"><div class="cart-progress-fill" style="width:${pct}%"></div></div>
        </div>
      `;
    } else if (calc.totalMarmitas < 10) {
      const pct = ((calc.totalMarmitas - 5) / 5) * 100;
      progressoInfo = `
        <div class="cart-combo-progress is-complete">
          <div class="cart-combo-progress-label">
            <span>✓ Combo 5 aplicado · Falta ${faltaCombo10} pro Combo 10</span>
            <small>${fmt(CONFIG.precos.combo10)}</small>
          </div>
          <div class="cart-progress-bar"><div class="cart-progress-fill" style="width:${pct}%"></div></div>
        </div>
      `;
    } else if (calc.totalMarmitas < 20) {
      const pct = ((calc.totalMarmitas - 10) / 10) * 100;
      progressoInfo = `
        <div class="cart-combo-progress is-complete">
          <div class="cart-combo-progress-label">
            <span>✓ Combo 10 aplicado · Falta ${faltaCombo20} pro Combo 20</span>
            <small>${fmt(CONFIG.precos.combo20)}</small>
          </div>
          <div class="cart-progress-bar"><div class="cart-progress-fill" style="width:${pct}%"></div></div>
        </div>
      `;
    } else if (calc.totalMarmitas < 30) {
      const pct = ((calc.totalMarmitas - 20) / 10) * 100;
      progressoInfo = `
        <div class="cart-combo-progress is-complete">
          <div class="cart-combo-progress-label">
            <span>✓ Combo 20 aplicado · Falta ${faltaCombo30} pro Combo 30</span>
            <small>${fmt(CONFIG.precos.combo30)}</small>
          </div>
          <div class="cart-progress-bar"><div class="cart-progress-fill" style="width:${pct}%"></div></div>
        </div>
      `;
    } else {
      progressoInfo = `
        <div class="cart-combo-progress is-complete">
          <div class="cart-combo-progress-label">
            <span>✓ Combo 30 aplicado — melhor preço!</span>
          </div>
        </div>
      `;
    }

    // Lista de itens
    const itemsHtml = calc.detalhes.map(({ flavor, qtd }) => {
      const ehPeixe = isPeixe(flavor.id);
      return `
        <div class="cart-item">
          <div class="cart-item-img">${flavor.imagem ? `<img src="${flavor.imagem}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:inherit">` : ''}</div>
          <div class="cart-item-info">
            <div class="cart-item-name">${flavor.nome}</div>
            <div class="cart-item-meta">${flavor.categoria}${ehPeixe ? ' · +R$5' : ''}</div>
          </div>
          <div class="cart-item-actions">
            <div class="qty-stepper" data-flavor-id="${flavor.id}">
              <button class="qty-btn" data-action="dec" aria-label="Diminuir">−</button>
              <span class="qty-display">${qtd}</span>
              <button class="qty-btn" data-action="inc" aria-label="Aumentar">+</button>
            </div>
            <button class="cart-item-remove" data-action="remove" data-flavor-id="${flavor.id}" aria-label="Remover">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    body.innerHTML = progressoInfo + itemsHtml;

    // Footer — totais
    const faixaLabel = {
      'avulso': 'Preço unitário',
      'combo5':  'Combo 5 aplicado',
      'combo10': 'Combo 10 aplicado',
      'combo20': 'Combo 20 aplicado',
      'combo30': 'Combo 30 aplicado',
      'combo20lowcarb': 'Combo 20 Low Carb',
    }[calc.faixa];

    foot.innerHTML = `
      ${calc.economia > 0 ? `
        <div class="cart-savings">
          🎉 Você economizou ${fmt(calc.economia)} com o combo!
        </div>
      ` : ''}

      <label class="feijao-toggle">
        <input type="checkbox" id="feijaoCheck" ${calc.feijao ? 'checked' : ''}>
        <div class="feijao-toggle-label">
          <span>Feijão em todas as marmitas</span>
          <span class="feijao-price">+ ${fmt(CONFIG.precos.acrescimoFeijao)}</span>
        </div>
      </label>

      <div class="cart-totals">
        <div class="cart-total-row">
          <span>${calc.totalMarmitas} marmitas</span>
          <span>${fmt(calc.precoBase)}</span>
        </div>
        ${calc.acrescimoPeixe > 0 ? `
          <div class="cart-total-row">
            <span>Acréscimo peixe (${calc.qtdPeixe}x)</span>
            <span>+ ${fmt(calc.acrescimoPeixe)}</span>
          </div>
        ` : ''}
        ${calc.feijao ? `
          <div class="cart-total-row">
            <span>Feijão em todas as marmitas</span>
            <span>+ ${fmt(calc.acrescimoFeijao)}</span>
          </div>
        ` : ''}

        <div class="cart-total-row">
          <span style="font-size:.78rem;color:var(--color-green-mid)">${faixaLabel}</span>
          <span></span>
        </div>
        <div class="cart-total-row is-main">
          <span>Total</span>
          <span>
            ${calc.economia > 0 ? `<span class="strike">${fmt(calc.valorSemCombo)}</span>` : ''}
            ${fmt(calc.subtotal)}
          </span>
        </div>
      </div>
      <button class="btn btn-primary btn-block btn-large" id="cartCheckoutBtn">
        Finalizar pedido →
      </button>
      <button class="btn btn-ghost btn-block" id="cartClearBtn" style="margin-top:8px">
        Limpar carrinho
      </button>
    `;

    $('#feijaoCheck')?.addEventListener('change', (e) => {
      Cart.setFeijao(e.target.checked);
    });

    // Handlers
    $$('#cartBody .qty-stepper').forEach(stepper => {
      const flavorId = stepper.dataset.flavorId;
      stepper.querySelector('[data-action="inc"]').addEventListener('click', () => {
        Cart.setQty(flavorId, Cart.getQty(flavorId) + 1);
      });
      stepper.querySelector('[data-action="dec"]').addEventListener('click', () => {
        Cart.setQty(flavorId, Math.max(0, Cart.getQty(flavorId) - 1));
      });
    });
    $$('#cartBody [data-action="remove"]').forEach(btn => {
      btn.addEventListener('click', () => Cart.remove(btn.dataset.flavorId));
    });

    $('#cartCheckoutBtn')?.addEventListener('click', () => {
      if (calc.lowCarbIncompleto) {
        alert(`O Combo Low Carb só é vendido com 20 marmitas por R$ 300,00. Você tem ${calc.totalMarmitas}. Adicione mais ${20 - calc.totalMarmitas} marmita(s) ou remova os sabores low carb para continuar.`);
        return;
      }
      if (calc.totalMarmitas < 5) {
        const ok = confirm(`Você tem ${calc.totalMarmitas} marmita(s). O pedido mínimo recomendado é 5 (Combo 5). Deseja continuar mesmo assim?`);
        if (!ok) return;
      }
      closeCart();
      Checkout.open();
    });

    $('#cartClearBtn')?.addEventListener('click', () => {
      if (confirm('Tem certeza que deseja limpar o carrinho?')) {
        Cart.clear();
        showToast('Carrinho limpo');
      }
    });
  }

  /* --- RENDER: Progresso no builder --- */
  function renderBuilderProgress() {
    const calc = Cart.calculate();
    const fill = $('#progressFill');
    const count = $('#progressCount');
    const hint = $('#progressHint');
    if (!fill) return;

    // Progress fill: 0-5 vai de 0-16.66%, 5-10 vai de 16.66-33.33%, 10-20 vai de 33.33-66.66%, 20-30 vai de 66.66-100%
    let pct = 0;
    if (calc.totalMarmitas <= 5) pct = (calc.totalMarmitas / 5) * 16.666;
    else if (calc.totalMarmitas <= 10) pct = 16.666 + ((calc.totalMarmitas - 5) / 5) * 16.666;
    else if (calc.totalMarmitas <= 20) pct = 33.333 + ((calc.totalMarmitas - 10) / 10) * 33.333;
    else if (calc.totalMarmitas <= 30) pct = 66.666 + ((calc.totalMarmitas - 20) / 10) * 33.334;
    else pct = 100;
    fill.style.width = pct + '%';

    count.textContent = calc.totalMarmitas;

    // Atualiza marcadores (5, 10, 20, 30)
    const markers = $$('.progress-marker');
    markers.forEach(m => m.classList.remove('is-reached'));
    if (calc.totalMarmitas >= 5)  markers[0]?.classList.add('is-reached');
    if (calc.totalMarmitas >= 10) markers[1]?.classList.add('is-reached');
    if (calc.totalMarmitas >= 20) markers[2]?.classList.add('is-reached');
    if (calc.totalMarmitas >= 30) markers[3]?.classList.add('is-reached');

    // Hint
    hint.classList.remove('is-complete');
    hint.classList.remove('is-warning');
    if (calc.temLowCarb && calc.totalMarmitas < 20) {
      hint.textContent = `⚠ Low Carb exige 20 marmitas — faltam ${20 - calc.totalMarmitas} (R$ 300,00)`;
      hint.classList.add('is-warning');
    } else if (calc.temLowCarb) {
      hint.textContent = `✓ Combo 20 Low Carb ativo — ${fmt(calc.precoMedio)}/marmita`;
      hint.classList.add('is-complete');
    } else if (calc.totalMarmitas === 0) {
      hint.textContent = 'Escolha pelo menos 5 marmitas para o Combo 5';
    } else if (calc.totalMarmitas < 5) {
      hint.textContent = `Falta ${5 - calc.totalMarmitas} pro Combo 5 (${fmt(CONFIG.precos.combo5)})`;
    } else if (calc.totalMarmitas < 10) {
      hint.textContent = `✓ Combo 5 ativo · Falta ${10 - calc.totalMarmitas} pro Combo 10 (${fmt(CONFIG.precos.combo10)})`;
      hint.classList.add('is-complete');
    } else if (calc.totalMarmitas < 20) {
      hint.textContent = `✓ Combo 10 ativo · Falta ${20 - calc.totalMarmitas} pro Combo 20 (${fmt(CONFIG.precos.combo20)})`;
      hint.classList.add('is-complete');
    } else if (calc.totalMarmitas < 30) {
      hint.textContent = `✓ Combo 20 ativo · Falta ${30 - calc.totalMarmitas} pro Combo 30 (${fmt(CONFIG.precos.combo30)})`;
      hint.classList.add('is-complete');
    } else {
      hint.textContent = `✓ Combo 30 ativo — ${fmt(calc.precoMedio)}/marmita`;
      hint.classList.add('is-complete');
    }
  }

  /* --- CARRINHO: abrir/fechar --- */
  function openCart() {
    $('#cartDrawer').classList.add('is-open');
    $('#cartOverlay').classList.add('is-open');
    $('#cartDrawer').setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeCart() {
    $('#cartDrawer').classList.remove('is-open');
    $('#cartOverlay').classList.remove('is-open');
    $('#cartDrawer').setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  /* --- Toast --- */
  let toastTimer = null;
  function showToast(msg, duration = 2500) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('is-visible'), duration);
  }

  /* --- Modal helpers --- */
  function openModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('is-open');
    el.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('is-open');
    el.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  function closeAllModals() {
    $$('.modal').forEach(m => {
      m.classList.remove('is-open');
      m.setAttribute('aria-hidden', 'true');
    });
    document.body.style.overflow = '';
  }

  /* --- Filtros do builder --- */
  function bindFilters() {
    $$('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.filter-btn').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const filter = btn.dataset.filter;
        $$('.flavor-card').forEach(card => {
          const show = filter === 'todos' || card.dataset.category === filter;
          card.classList.toggle('is-hidden', !show);
        });
      });
    });
  }

  /* --- Personalização de combos (Modal) --- */
  let activeCustomCombo = null;
  const customSelections = new Map();

  function openCustomizeComboModal(comboId) {
    const combo = COMBOS.find(c => c.id === comboId);
    if (!combo) return;

    activeCustomCombo = combo;
    customSelections.clear();

    // Pre-fill com itens padrão do combo
    combo.itens.forEach(({ flavorId, qtd }) => {
      customSelections.set(flavorId, qtd);
    });

    // Atualiza cabeçalho do modal
    $('#customizeComboTitle').textContent = `Personalizar ${combo.titulo}`;
    $('#customizeComboSub').textContent = `Ajuste os sabores abaixo para completar exatamente ${combo.qtd} marmitas.`;
    $('#customizeRequiredCount').textContent = combo.qtd;

    // Filtra sabores válidos conforme o combo selecionado
    let filteredFlavors = [];
    const idLower = combo.id.toLowerCase();
    const tipoLower = combo.tipo.toLowerCase();

    if (idLower.includes('lowcarb') || tipoLower.includes('lowcarb')) {
      filteredFlavors = FLAVORS.filter(f => f.categoria === 'lowcarb');
    } else if (idLower.includes('carne') || tipoLower.includes('carne')) {
      filteredFlavors = FLAVORS.filter(f => f.categoria === 'carne');
    } else if (idLower.includes('frango') || tipoLower.includes('frango')) {
      filteredFlavors = FLAVORS.filter(f => f.categoria === 'frango');
    } else {
      // Combos normais (Mix): todos exceto os Low Carb
      filteredFlavors = FLAVORS.filter(f => f.categoria !== 'lowcarb');
    }

    renderCustomizeFlavorsList(filteredFlavors);
    updateCustomizeStatus();
    openModal('customizeComboModal');
  }

  function renderCustomizeFlavorsList(flavors) {
    const container = $('#customizeFlavorsList');
    if (!container) return;

    const categories = {
      carne: 'Carnes',
      frango: 'Frangos',
      porco: 'Porcos',
      peixe: 'Peixes',
      lowcarb: 'Low Carb'
    };

    const usedCategories = Object.keys(categories).filter(cat => 
      flavors.some(f => f.categoria === cat)
    );

    let html = '';

    usedCategories.forEach(cat => {
      const catFlavors = flavors.filter(f => f.categoria === cat);
      if (catFlavors.length === 0) return;

      html += `
        <div class="customize-category-header" style="font-size: 0.78rem; font-weight: 700; color: var(--color-green-dark); background: var(--color-cream-soft); padding: 6px 12px; margin-top: 10px; border-radius: var(--r-sm); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border-soft);">
          ${categories[cat]}
        </div>
      `;

      const LIMITE_POR_SABOR = 4;

      html += catFlavors.map(flavor => {
        const qtd = customSelections.get(flavor.id) || 0;
        const ehPeixe = isPeixe(flavor.id);
        const incDisabled = qtd >= LIMITE_POR_SABOR ? 'disabled' : '';
        const imageHtml = flavor.imagem 
          ? `<img src="${flavor.imagem}" alt="" style="width: 38px; height: 38px; object-fit: cover; border-radius: var(--r-sm); flex-shrink: 0;">`
          : `<div style="width: 38px; height: 38px; background: var(--color-cream); border-radius: var(--r-sm); display: flex; align-items: center; justify-content: center; font-size: 0.6rem; color: var(--text-soft); font-weight: bold; flex-shrink: 0;">Foto</div>`;

        return `
          <div class="customize-flavor-row" data-flavor-id="${flavor.id}">
            <div style="display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0;">
              ${imageHtml}
              <div class="customize-flavor-info" style="min-width: 0;">
                <div class="customize-flavor-name-row">
                  <span class="customize-flavor-name" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${flavor.nome}</span>
                  ${ehPeixe ? '<span class="flavor-category-tag cat-peixe" style="font-size:0.65rem; padding:2px 8px; margin-left: 4px; background: #e0f2fe; color: #0369a1; border-radius: 999px;">+R$5 peixe</span>' : ''}
                </div>
                <span class="customize-flavor-desc" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${flavor.descricao}</span>
              </div>
            </div>
            <div class="qty-stepper" data-flavor-id="${flavor.id}">
              <button class="qty-btn" data-action="dec-custom" data-flavor-id="${flavor.id}">−</button>
              <span class="qty-display" id="custom-qty-${flavor.id}">${qtd}</span>
              <button class="qty-btn" data-action="inc-custom" data-flavor-id="${flavor.id}" ${incDisabled}>+</button>
            </div>
          </div>
        `;
      }).join('');
    });

    container.innerHTML = html;

    // Listeners para os botões inc/dec do modal
    const LIMITE_POR_SABOR = 4;

    container.querySelectorAll('[data-action="inc-custom"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const fId = btn.dataset.flavorId;
        const currentQty = customSelections.get(fId) || 0;

        // Limite por sabor individual
        if (currentQty >= LIMITE_POR_SABOR) {
          showToast(`Máximo de ${LIMITE_POR_SABOR} unidades por sabor.`);
          return;
        }

        // Limite total do combo
        const currentTotal = getCustomSelectedTotal();
        if (currentTotal >= activeCustomCombo.qtd) {
          showToast(`Você já selecionou o limite de ${activeCustomCombo.qtd} marmitas.`);
          return;
        }

        const newQty = currentQty + 1;
        customSelections.set(fId, newQty);

        const display = container.querySelector(`#custom-qty-${fId}`);
        if (display) display.textContent = newQty;

        // Desabilita o botão + se atingiu o limite por sabor
        if (newQty >= LIMITE_POR_SABOR) btn.disabled = true;

        // Reabilita o botão − se estava desabilitado
        const decBtn = container.querySelector(`[data-action="dec-custom"][data-flavor-id="${fId}"]`);
        if (decBtn) decBtn.disabled = false;

        updateCustomizeStatus();
      });
    });

    container.querySelectorAll('[data-action="dec-custom"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const fId = btn.dataset.flavorId;
        const currentQty = customSelections.get(fId) || 0;
        if (currentQty <= 0) return;

        const newQty = currentQty - 1;
        if (newQty === 0) {
          customSelections.delete(fId);
        } else {
          customSelections.set(fId, newQty);
        }

        const display = container.querySelector(`#custom-qty-${fId}`);
        if (display) display.textContent = newQty;

        // Reabilita o botão + se estava desabilitado pelo limite por sabor
        const incBtn = container.querySelector(`[data-action="inc-custom"][data-flavor-id="${fId}"]`);
        if (incBtn && newQty < LIMITE_POR_SABOR) incBtn.disabled = false;

        updateCustomizeStatus();
      });
    });
  }

  function getCustomSelectedTotal() {
    let total = 0;
    customSelections.forEach(q => total += q);
    return total;
  }

  function updateCustomizeStatus() {
    const total = getCustomSelectedTotal();
    const required = activeCustomCombo.qtd;
    
    const countDisplay = $('#customizeSelectedCount');
    if (countDisplay) countDisplay.textContent = total;

    const feedbackDisplay = $('#customizeSelectionFeedback');
    const confirmBtn = $('#confirmCustomizeComboBtn');

    if (feedbackDisplay && confirmBtn) {
      feedbackDisplay.classList.remove('is-complete', 'is-warning');
      
      if (total === required) {
        feedbackDisplay.textContent = '';
        feedbackDisplay.style.display = 'none';
        confirmBtn.disabled = false;
      } else if (total < required) {
        const falta = required - total;
        feedbackDisplay.textContent = `Falta escolher ${falta} marmita${falta > 1 ? 's' : ''}`;
        feedbackDisplay.classList.add('is-warning');
        feedbackDisplay.style.display = 'inline-block';
        confirmBtn.disabled = true;
      } else {
        const excesso = total - required;
        feedbackDisplay.textContent = `Remova ${excesso} marmita${excesso > 1 ? 's' : ''}`;
        feedbackDisplay.classList.add('is-warning');
        feedbackDisplay.style.display = 'inline-block';
        confirmBtn.disabled = true;
      }
    }
  }

  function confirmCustomizeCombo() {
    if (!activeCustomCombo) return;
    const total = getCustomSelectedTotal();
    const required = activeCustomCombo.qtd;

    if (total !== required) {
      alert(`Por favor, selecione exatamente ${required} marmitas.`);
      return;
    }

    if (Cart.getTotalItems() > 0) {
      if (!confirm('Isso vai substituir o conteúdo atual do carrinho. Continuar?')) return;
    }

    const customizedCombo = {
      ...activeCustomCombo,
      itens: Array.from(customSelections.entries())
        .filter(([, qtd]) => qtd > 0)   // ignora sabores com qtd 0
        .map(([flavorId, qtd]) => ({ flavorId, qtd }))
    };

    Cart.replaceWith(customizedCombo);
    closeAllModals();
    showToast(`${activeCustomCombo.titulo} personalizado adicionado!`);
    openCart();
  }

  /* --- Bind de eventos gerais --- */
  function bindGlobal() {
    $('#cartTrigger')?.addEventListener('click', openCart);
    $('#cartClose')?.addEventListener('click', closeCart);
    $('#cartOverlay')?.addEventListener('click', closeCart);
    $('#confirmCustomizeComboBtn')?.addEventListener('click', confirmCustomizeCombo);

    // Fechar modais
    $$('[data-close-modal]').forEach(el => {
      el.addEventListener('click', closeAllModals);
    });

    // Esc fecha tudo
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeCart();
        closeAllModals();
      }
    });
  }

  return {
    renderCombos, renderFlavors, renderCart, renderBuilderProgress,
    bindFilters, bindGlobal,
    openCart, closeCart,
    openModal, closeModal, closeAllModals,
    showToast,
  };
})();
