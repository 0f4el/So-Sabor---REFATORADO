/* ==========================================================
   CONFIG.JS
   ----------------------------------------------------------
   Configurações centrais do site. Edite aqui para mudar
   telefone, PIX, preços dos combos, descontos, etc.
   ========================================================== */

const CONFIG = {
  // Loja
  loja: {
    nome: 'Só Sabor',
    whatsapp: '5531973583783',  // número com 55 (Brasil) + DDD + número, sem símbolos
    whatsappDisplay: '(31) 97358-3783',
    cnpj: '54.888.460/0001-27',
  },

  // PIX
  pix: {
    chave: '54.888.460/0001-27',
    tipo: 'CNPJ',
    titular: 'Agiliza Log',
    banco: 'Infinitepay',
  },

  // Preços
  precos: {
    unitario: 19.00,           // preço da marmita avulsa (fora de combo)
    acrescimoPeixe: 5.00,      // acréscimo por marmita de peixe
    acrescimoFeijao: 20.00,    // acréscimo por combo ao adicionar feijão em todas as marmitas
    combo5:  120.00,           // combo de 5 marmitas
    combo10: 180.00,           // combo de 10 marmitas (mix)
    combo20: 260.00,           // combo de 20 marmitas (mix)
    combo30: 375.00,           // combo de 30 marmitas (mix)
    combo20Carne: 300.00,      // combo fechado — só carne
    combo20Frango: 280.00,     // combo fechado — só frango
    combo20LowCarb: 300.00,    // combo low carb
  },

  // Formas de pagamento (sem ajuste de preço)
  pagamento: {
    pix:      { tipo: 'nenhum', percentual: 0, label: '' },
    dinheiro: { tipo: 'nenhum', percentual: 0, label: '' },
    credito:  { tipo: 'acrescimo', percentual: 5, label: 'Cartão de Crédito' },
    debito:   { tipo: 'acrescimo', percentual: 5, label: 'Cartão de Débito' },
  },
};

// Helpers globais de formatação
const fmt = (v) => 'R$ ' + Number(v).toFixed(2).replace('.', ',');
