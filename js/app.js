/* ============================================================
   FEIRA DIGITAL DA ROÇA — Application Logic
   Supabase + SPA
   ============================================================ */
(function () {
  'use strict';

  let db = null;

  function initSupabase() {
    if (
      typeof SUPABASE_URL === 'undefined' || !SUPABASE_URL || SUPABASE_URL.includes('SEU_PROJETO') ||
      typeof SUPABASE_KEY === 'undefined' || !SUPABASE_KEY || SUPABASE_KEY.includes('SUA_ANON_KEY')
    ) {
      return false;
    }
    try {
      const { createClient } = supabase;
      db = createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true, flowType: 'pkce' }
      });
      return true;
    } catch (e) {
      console.error('Supabase init error:', e);
      return false;
    }
  }

  function showConfigError() {
    const ls = document.getElementById('loading-screen');
    if (ls) ls.remove();
    document.getElementById('app').innerHTML = `
      <div style="padding:80px;text-align:center;max-width:500px;margin:0 auto;">
        <div style="font-size:3rem;margin-bottom:16px;">⚙️</div>
        <h2>Configuração necessária</h2>
        <p style="color:#5E7A6B;margin-top:12px;line-height:1.6;">Para usar a plataforma, configure as credenciais do Supabase no arquivo <code>js/config.js</code>.</p>
      </div>
    `;
  }

  const state = {
    user: null,
    produtor: null,
    categorias: [],
    catalogFilters: { busca: '', categoria_id: null, produtor_id: null, ordem: 'recentes' }
  };

  async function init() {
    if (!initSupabase()) { showConfigError(); return; }
    hideLoading();
    setupNavbar();
    setupModal();

    try {
      const { data: { session } } = await db.auth.getSession();
      if (session) await onLogin(session.user, false);
    } catch (e) {
      console.warn('Sessão não encontrada:', e.message);
    }

    db.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) await onLogin(session.user, false);
      if (event === 'SIGNED_OUT') await onLogout();
    });

    window.addEventListener('hashchange', router);
    router();
  }

  async function onLogin(user, navigateHome = true) {
    state.user = user;
    try {
      const { data, error } = await db.from('produtores').select('*').eq('id', user.id).single();
      if (!error && data) { state.produtor = data; updateNavbarAuth(); }
    } catch (e) {
      console.warn('Produtor não encontrado:', e.message);
    }
    if (navigateHome) navigate('dashboard');
  }

  async function onLogout() {
    state.user = null;
    state.produtor = null;
    updateNavbarAuth();
    navigate('');
  }

  function router() {
    const hash = window.location.hash.replace('#', '') || '';
    const parts = hash.split('/');
    const route = parts[0];
    const param = parts[1];

    closeMobileMenu();

    const routes = {
      '': renderCatalog,
      'catalog': renderCatalog,
      'producers': renderProducers,
      'login': renderLogin,
      'register': renderRegister,
      'dashboard': renderDashboard,
      'admin': renderAdmin,
      'profile-edit': renderProfileEdit
    };

    if (route === 'producer' && param) return renderProducerProfile(param);
    if (typeof routes[route] === 'function') return routes[route]();
    renderCatalog();
  }

  function navigate(hash) { window.location.hash = hash; }

  function setupNavbar() {
    window.addEventListener('scroll', () => {
      document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });

    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('hidden', !isOpen);
    });

    const avatarBtn = document.getElementById('user-avatar-btn');
    const userArea = document.getElementById('user-area');
    if (avatarBtn) {
      avatarBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userArea.classList.toggle('open');
      });
      document.addEventListener('click', () => userArea.classList.remove('open'));
    }

    document.getElementById('btn-logout')?.addEventListener('click', doLogout);
    document.getElementById('mobile-logout')?.addEventListener('click', doLogout);

    async function doLogout() {
      await db.auth.signOut();
      toast('success', 'Até logo!', 'Você saiu da sua conta.');
    }
  }

  function closeMobileMenu() {
    document.getElementById('hamburger').classList.remove('open');
    document.getElementById('mobile-menu').classList.add('hidden');
  }

  function updateNavbarAuth() {
    const p = state.produtor;
    const isLogged = !!state.user;
    document.getElementById('guest-buttons').classList.toggle('hidden', isLogged);
    document.getElementById('user-area').classList.toggle('hidden', !isLogged);
    document.getElementById('mobile-guest').classList.toggle('hidden', isLogged);
    document.getElementById('mobile-user').classList.toggle('hidden', !isLogged);

    if (isLogged && p) {
      const initials = p.nome.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
      document.getElementById('avatar-initials').textContent = initials;
      document.getElementById('dropdown-name').textContent = p.nome;
      document.getElementById('dropdown-role').textContent = p.is_admin ? '🛡️ Admin' : '👨‍🌾 Produtor';
      document.getElementById('link-admin').classList.toggle('hidden', !p.is_admin);
      document.getElementById('mobile-admin-link').classList.toggle('hidden', !p.is_admin);
    }
  }

  async function getProdutos(filters = {}) {
    let query = db.from('produtos').select('*, produtores(*), categorias(*)').order('criado_em', { ascending: false });
    if (filters.categoria_id) query = query.eq('categoria_id', filters.categoria_id);
    if (filters.produtor_id) query = query.eq('produtor_id', filters.produtor_id);
    if (filters.busca) query = query.ilike('nome', `%${filters.busca}%`);
    query = query.eq('disponivel', true);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async function renderCatalog() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <section class="hero">
        <div class="hero-content">
          <div class="hero-eyebrow">🌾 Agricultura Familiar</div>
          <h1>Produtos frescos direto<br><em>da roça para você</em></h1>
          <div class="hero-search">
            <input class="hero-search-input" id="hero-search" type="search" placeholder="Buscar tomate, alface, mel...">
            <button class="hero-search-btn" id="hero-search-btn">🔍 Buscar</button>
          </div>
        </div>
      </section>
      <section class="section">
        <div class="container">
          <div class="products-grid" id="products-grid"><div class="spinner" style="margin:40px auto;"></div></div>
        </div>
      </section>
    `;
    try {
      const produtos = await getProdutos(state.catalogFilters);
      renderProductCards(produtos);
    } catch (e) {
      console.error(e);
    }
  }

  function renderProductCards(produtos) {
    const grid = document.getElementById('products-grid');
    if (!produtos.length) {
      grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:#5E7A6B;"><h3>Nenhum produto encontrado</h3></div>`;
      return;
    }
    grid.innerHTML = produtos.map(p => `
      <article class="product-card">
        <div class="product-img-wrap">
          <span>${p.categorias?.icone || '🌾'}</span>
        </div>
        <div class="product-body">
          <h3 style="font-family:'Outfit',sans-serif;font-size:1.1rem;">${esc(p.nome)}</h3>
          <div class="product-price-value">R$ ${parseFloat(p.preco).toFixed(2)} / ${esc(p.unidade || 'un')}</div>
        </div>
      </article>
    `).join('');
  }

  function renderProducers() { document.getElementById('app').innerHTML = `<div class="container" style="padding:40px"><h1>Produtores</h1></div>`; }
  function renderLogin() { document.getElementById('app').innerHTML = `<div class="container" style="padding:40px"><h1>Login</h1></div>`; }
  function renderRegister() { document.getElementById('app').innerHTML = `<div class="container" style="padding:40px"><h1>Cadastro</h1></div>`; }
  function renderDashboard() { document.getElementById('app').innerHTML = `<div class="container" style="padding:40px"><h1>Painel</h1></div>`; }
  function renderAdmin() { document.getElementById('app').innerHTML = `<div class="container" style="padding:40px"><h1>Admin</h1></div>`; }
  function renderProfileEdit() { document.getElementById('app').innerHTML = `<div class="container" style="padding:40px"><h1>Editar Perfil</h1></div>`; }
  function renderProducerProfile(id) { document.getElementById('app').innerHTML = `<div class="container" style="padding:40px"><h1>Perfil ${id}</h1></div>`; }

  function setupModal() {
    document.getElementById('modal-close').addEventListener('click', closeModal);
  }
  function closeModal() { document.getElementById('modal-overlay').classList.add('hidden'); }
  function toast(type, title, message) { console.log(`[${type}] ${title}: ${message}`); }
  function hideLoading() { const ls = document.getElementById('loading-screen'); if (ls) ls.remove(); }
  function esc(str) { return str ? String(str).replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''; }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
