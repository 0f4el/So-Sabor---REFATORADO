/* ==========================================================
   CHECKOUT.JS
   ----------------------------------------------------------
   Modal de finalização + envio pro WhatsApp + PIX.
   ========================================================== */

const Checkout = (function() {
  const $ = (s, el = document) => el.querySelector(s);

  let lastOrderData = null;   // guardado pra usar no PIX modal

  function open() {
    const calc = Cart.calculate();
    if (calc.totalMarmitas === 0) {
      UI.showToast('Adicione marmitas ao carrinho antes de finalizar');
      return;
    }
    UI.openModal('checkoutModal');
    updateSummary();
  }

  function updateSummary() {
    const calc = Cart.calculate();
    const form = $('#checkoutForm');
    const payment = form.querySelector('input[name="pagamento"]:checked')?.value || 'pix';
    const adj = Cart.applyPaymentAdjustment(calc.subtotal, payment);

    const rows = [
      `<div class="checkout-summary-row"><span>${calc.totalMarmitas} marmitas ${calc.qtdPeixe ? `(${calc.qtdPeixe} peixe)` : ''}</span><span>${fmt(calc.precoBase + calc.acrescimoPeixe)}</span></div>`,
    ];
    if (calc.feijao) {
      rows.push(`<div class="checkout-summary-row"><span>\ud83e\uded8 Feij\u00e3o em todas as marmitas</span><span>+ ${fmt(calc.acrescimoFeijao)}</span></div>`);
    }
    if (adj.ajuste < 0) {
      rows.push(`<div class="checkout-summary-row"><span class="discount">${adj.label}</span><span class="discount">− ${fmt(Math.abs(adj.ajuste))}</span></div>`);
    } else if (adj.ajuste > 0) {
      rows.push(`<div class="checkout-summary-row"><span class="surcharge">${adj.label}</span><span class="surcharge">+ ${fmt(adj.ajuste)}</span></div>`);
    }
    rows.push(`<div class="checkout-summary-row total"><span>Total</span><span>${fmt(adj.total)}</span></div>`);
    rows.push(`<div class="checkout-summary-row"><span style="font-size:.78rem;color:var(--text-soft)">+ Frete (combinar por WhatsApp)</span><span></span></div>`);

    $('#checkoutSummary').innerHTML = rows.join('');
  }

  /* --- Formata CEP enquanto digita --- */
  function bindCepMask() {
    const input = $('#c_cep');
    if (!input) return;
    input.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '').slice(0, 8);
      if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5);
      e.target.value = v;
    });
  }

  /* --- Validação simples --- */
  function validate(form) {
    let ok = true;
    const required = ['nome', 'cep', 'bairro', 'endereco'];
    required.forEach(name => {
      const f = form.elements[name];
      const invalid = !f.value.trim();
      f.classList.toggle('is-invalid', invalid);
      if (invalid) ok = false;
    });
    return ok;
  }

  /* --- Monta a mensagem formatada pro WhatsApp --- */
  function buildWhatsappMessage(data) {
    const calc = data.calc;
    const lines = [];
    lines.push('*🍲 NOVO PEDIDO — Só Sabor*');
    lines.push('');
    lines.push('*👤 CLIENTE*');
    lines.push(`Nome: ${data.nome}`);
    lines.push('');
    lines.push('*📍 ENDEREÇO*');
    lines.push(`CEP: ${data.cep}`);
    lines.push(`${data.endereco}`);
    lines.push(`Bairro: ${data.bairro}`);
    lines.push('');
    lines.push('*🍱 PEDIDO*');

    // Agrupa por categoria
    const categorias = { frango: [], carne: [], porco: [], peixe: [], lowcarb: [] };
    calc.detalhes.forEach(({ flavor, qtd }) => {
      if (categorias[flavor.categoria]) {
        categorias[flavor.categoria].push(`  ${qtd}x ${flavor.nome}`);
      }
    });
    const labels = { frango: 'Frango', carne: 'Carne', porco: 'Porco', peixe: 'Peixe', lowcarb: 'Low Carb' };
    Object.keys(categorias).forEach(cat => {
      if (categorias[cat].length) {
        lines.push(`*${labels[cat]}*`);
        lines.push(categorias[cat].join('\n'));
      }
    });

    lines.push('');
    lines.push(`Total de marmitas: *${calc.totalMarmitas}*`);
    if (calc.qtdPeixe > 0) lines.push(`(${calc.qtdPeixe} de peixe \u00b7 +${fmt(calc.acrescimoPeixe)})`);
    if (calc.feijao) lines.push(`\ud83e\uded8 Feij\u00e3o em todas as marmitas \u00b7 +${fmt(calc.acrescimoFeijao)}`);

    const faixaLabel = {
      'avulso': 'Avulso',
      'combo5': 'Combo 5 aplicado',
      'combo10': 'Combo 10 aplicado',
      'combo20': 'Combo 20 aplicado',
      'combo30': 'Combo 30 aplicado',
      'combo20lowcarb': 'Combo 20 Low Carb',
    }[calc.faixa] || calc.faixa;
    lines.push(`Faixa: ${faixaLabel}`);

    lines.push('');
    lines.push('*💰 PAGAMENTO*');
    const payLabels = {
      'pix': 'Pix',
      'dinheiro': 'Dinheiro na entrega',
      'credito': 'Cartão de Crédito',
      'debito': 'Cartão de Débito',
    };
    lines.push(`Forma: ${payLabels[data.pagamento]}`);
    lines.push(`Subtotal: ${fmt(calc.subtotal)}`);
    const adj = Cart.applyPaymentAdjustment(calc.subtotal, data.pagamento);
    if (adj.ajuste !== 0) {
      const sign = adj.ajuste < 0 ? '−' : '+';
      lines.push(`${adj.label}: ${sign} ${fmt(Math.abs(adj.ajuste))}`);
    }
    lines.push(`*Total: ${fmt(adj.total)}*`);
    lines.push('_(+ frete a combinar)_');

    if (data.observacoes) {
      lines.push('');
      lines.push('*📝 OBSERVAÇÕES*');
      lines.push(data.observacoes);
    }

    lines.push('');
    lines.push('_Pedido enviado pelo site._');

    return lines.join('\n');
  }

  /* --- Envia para o WhatsApp --- */
  function sendToWhatsapp(message) {
    const phone = CONFIG.loja.whatsapp;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    // Usa link âncora para evitar bloqueio de popup em navegadores mobile
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  /* --- Bind do form --- */
  function bindForm() {
    const form = $('#checkoutForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validate(form)) {
        UI.showToast('Preencha os campos obrigatórios');
        return;
      }

      const data = {
        nome: form.elements.nome.value.trim(),
        cep: form.elements.cep.value.trim(),
        bairro: form.elements.bairro.value.trim(),
        endereco: form.elements.endereco.value.trim(),
        observacoes: form.elements.observacoes.value.trim(),
        pagamento: form.elements.pagamento.value,
        calc: Cart.calculate(),
      };
      lastOrderData = data;

      const message = buildWhatsappMessage(data);

      // Se é Pix, abre o modal do Pix antes de mandar pro WhatsApp
      if (data.pagamento === 'pix') {
        UI.closeAllModals();
        openPixModal(data, message);
      } else {
        sendToWhatsapp(message);
        UI.closeAllModals();
        UI.showToast('Pedido enviado pro WhatsApp!');
      }
    });

    // Atualiza resumo ao mudar forma de pagamento
    form.addEventListener('change', (e) => {
      if (e.target.name === 'pagamento') updateSummary();
    });

    bindCepMask();
  }

  /* --- Modal PIX --- */
  function openPixModal(data, message) {
    const adj = Cart.applyPaymentAdjustment(data.calc.subtotal, 'pix');
    $('#pixAmount').textContent = fmt(adj.total);
    UI.openModal('pixModal');

    // Botão copiar
    $('#copyPix').onclick = () => {
      const key = CONFIG.pix.chave;
      navigator.clipboard.writeText(key).then(() => {
        UI.showToast('Chave Pix copiada!');
        $('#copyPix').textContent = '✓ Copiado';
        setTimeout(() => { $('#copyPix').textContent = 'Copiar'; }, 2500);
      }).catch(() => {
        UI.showToast('Copie manualmente: ' + key, 4000);
      });
    };

    // Enviar comprovante
    $('#pixSendWhatsapp').onclick = () => {
      sendToWhatsapp(message + '\n\n✅ Pagamento feito via Pix — enviando comprovante em seguida!');
    };
  }

  return { open, bindForm };
})();
