/* ==========================================================
   APP.JS
   ----------------------------------------------------------
   Inicialização. Roda depois de todos os outros scripts.
   ========================================================== */

(async function init() {
  // Carrega o catálogo do banco de dados
  await loadCatalog();

  // Renderiza conteúdos dinâmicos
  UI.renderCombos();
  UI.renderFlavors('todos');
  UI.renderCart();
  UI.renderBuilderProgress();

  // Binds
  UI.bindFilters();
  UI.bindGlobal();
  Checkout.bindForm();

  // Re-renderiza sempre que o carrinho muda
  Cart.subscribe(() => {
    UI.renderCart();
    UI.renderBuilderProgress();
    // Atualiza os displays dos steppers do builder (só os números)
    document.querySelectorAll('#flavorsGrid .qty-stepper').forEach(stepper => {
      const id = stepper.dataset.flavorId;
      const qtd = Cart.getQty(id);
      const display = stepper.querySelector('.qty-display');
      const dec = stepper.querySelector('[data-action="dec"]');
      if (display) display.textContent = qtd;
      if (dec) dec.disabled = qtd === 0;
    });
  });
})();
