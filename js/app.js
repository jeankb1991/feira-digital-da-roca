/* ============================================================
   FEIRA DIGITAL DA ROÇA — Application Logic
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
        <p style="color:#5E7A6B;margin-top:12px;line-height:1.6;">Configure as credenciais do Supabase em <code>js/config.js</code>.</p>
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
      console.warn('Sessão:', e.message);
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
      console.warn('Produtor:', e.message);
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
      toast('success', 'Até logo!', 'Sessão encerrada.');
    }
  }

  function closeMobileMenu() {
    document.getElementById('hamburger')?.classList.remove('open');
    document.getElementById('mobile-menu')?.classList.add('hidden');
  }

  function updateNavbarAuth() {
    const p = state.produtor;
    const isLogged = !!state.user;
    document.getElementById('guest-buttons')?.classList.toggle('hidden', isLogged);
    document.getElementById('user-area')?.classList.toggle('hidden', !isLogged);
    document.getElementById('mobile-guest')?.classList.toggle('hidden', isLogged);
    document.getElementById('mobile-user')?.classList.toggle('hidden', !isLogged);

    if (isLogged && p) {
      const initials = p.nome.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
      document.getElementById('avatar-initials').textContent = initials;
      document.getElementById('dropdown-name').textContent = p.nome;
      document.getElementById('dropdown-role').textContent = p.is_admin ? '🛡️ Admin' : '👨‍🌾 Produtor';
      document.getElementById('link-admin')?.classList.toggle('hidden', !p.is_admin);
      document.getElementById('mobile-admin-link')?.classList.toggle('hidden', !p.is_admin);
    }
  }

  async function getCategorias() {
    if (state.categorias.length) return state.categorias;
    const { data, error } = await db.from('categorias').select('*').order('id');
    if (error) throw error;
    state.categorias = data || [];
    return state.categorias;
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

  async function getProdutores() {
    const { data, error } = await db.from('produtores').select('*').eq('status', 'ativo').order('nome');
    if (error) throw error;
    return data || [];
  }

  async function getAllProdutores() {
    const { data, error } = await db.from('produtores').select('*').order('criado_em', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async function getAllProdutos() {
    const { data, error } = await db.from('produtos').select('*, produtores(*), categorias(*)').order('criado_em', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async function upsertProduto(produto) {
    if (!state.user) throw new Error('Não autenticado.');
    const payload = { ...produto, produtor_id: state.produtor?.is_admin ? (produto.produtor_id || state.user.id) : state.user.id };
    if (payload.id) {
      const { data, error } = await db.from('produtos').update(payload).eq('id', payload.id).select().single();
      if (error) throw error;
      return data;
    } else {
      delete payload.id;
      const { data, error } = await db.from('produtos').insert(payload).select().single();
      if (error) throw error;
      return data;
    }
  }

  async function deleteProdutoAdmin(id) {
    const { error } = await db.from('produtos').delete().eq('id', id);
    if (error) throw error;
  }

  async function updateProdutorStatus(id, status) {
    const { error } = await db.from('produtores').update({ status }).eq('id', id);
    if (error) throw error;
  }

  async function uploadFoto(file) {
    if (file.size > 5 * 1024 * 1024) throw new Error('Foto muito grande (máx 5MB).');
    const ext = file.name.split('.').pop().toLowerCase();
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await db.storage.from('fotos').upload(name, file, { upsert: false, contentType: file.type });
    if (error) throw error;
    const { data } = db.storage.from('fotos').getPublicUrl(name);
    return data.publicUrl;
  }

  async function doRegister(formData) {
    const { email, senha, ...perfil } = formData;
    const { data: authData, error: authErr } = await db.auth.signUp({ email, password: senha });
    if (authErr) throw authErr;
    if (!authData.user) throw new Error('Falha ao registar.');
    const { error: profErr } = await db.from('produtores').insert({ id: authData.user.id, ...perfil });
    if (profErr) throw profErr;
    return authData.user;
  }

  async function doLogin(email, senha) {
    const { data, error } = await db.auth.signInWithPassword({ email, password: senha });
    if (error) throw error;
    return data.user;
  }

  // --- RENDER: CATÁLOGO ---
  async function renderCatalog() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <section class="hero">
        <div class="hero-content">
          <div class="hero-eyebrow">🌾 Agricultura Familiar</div>
          <h1>Produtos frescos direto<br><em>da roça para você</em></h1>
          <div class="hero-search">
            <input class="hero-search-input" id="hero-search" type="search" placeholder="Buscar tomate, alface, mel..." value="${esc(state.catalogFilters.busca)}">
            <button class="hero-search-btn" id="hero-search-btn">🔍 Buscar</button>
          </div>
        </div>
      </section>
      <section class="section">
        <div class="container">
          <div class="category-pills" id="cat-pills" style="display:flex;gap:10px;margin-bottom:24px;flex-wrap:wrap;">
            <button class="pill ${!state.catalogFilters.categoria_id ? 'active' : ''}" data-id="">🛒 Todos</button>
          </div>
          <div class="products-toolbar">
            <span class="results-count" id="results-count">Carregando...</span>
            <select class="filter-select" id="filter-ordem">
              <option value="recentes">Mais recentes</option>
              <option value="preco_asc">Menor preço</option>
              <option value="preco_desc">Maior preço</option>
            </select>
          </div>
          <div class="products-grid" id="products-grid"><div class="spinner" style="margin:40px auto;"></div></div>
        </div>
      </section>
    `;

    try {
      const [cats, produtos] = await Promise.all([getCategorias(), getProdutos(state.catalogFilters)]);
      const pils = document.getElementById('cat-pills');
      cats.forEach(c => {
        const btn = document.createElement('button');
        btn.className = `pill ${state.catalogFilters.categoria_id == c.id ? 'active' : ''}`;
        btn.dataset.id = c.id;
        btn.innerHTML = `${c.icone} ${esc(c.nome)}`;
        pils.appendChild(btn);
      });

      pils.addEventListener('click', (e) => {
        const btn = e.target.closest('.pill');
        if (!btn) return;
        state.catalogFilters.categoria_id = btn.dataset.id ? Number(btn.dataset.id) : null;
        document.querySelectorAll('#cat-pills .pill').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        reloadProducts();
      });

      document.getElementById('hero-search-btn').addEventListener('click', () => {
        state.catalogFilters.busca = document.getElementById('hero-search').value.trim();
        reloadProducts();
      });
      document.getElementById('hero-search').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          state.catalogFilters.busca = document.getElementById('hero-search').value.trim();
          reloadProducts();
        }
      });
      document.getElementById('filter-ordem').addEventListener('change', (e) => {
        state.catalogFilters.ordem = e.target.value;
        reloadProducts();
      });

      renderProductCards(produtos);
    } catch (e) {
      console.error(e);
    }
  }

  async function reloadProducts() {
    try {
      let produtos = await getProdutos(state.catalogFilters);
      if (state.catalogFilters.ordem === 'preco_asc') produtos.sort((a,b)=>a.preco-b.preco);
      if (state.catalogFilters.ordem === 'preco_desc') produtos.sort((a,b)=>b.preco-a.preco);
      renderProductCards(produtos);
    } catch(e) { console.error(e); }
  }

  function renderProductCards(produtos) {
    const grid = document.getElementById('products-grid');
    const count = document.getElementById('results-count');
    if (count) count.innerHTML = `<strong>${produtos.length}</strong> produto(s) encontrado(s)`;
    if (!produtos.length) {
      grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:#5E7A6B;"><h3>Nenhum produto encontrado</h3></div>`;
      return;
    }
    grid.innerHTML = produtos.map(p => {
      const preco = parseFloat(p.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      const whats = getWhatsAppUrl(p.produtores?.whatsapp, p.nome);
      return `
        <article class="product-card">
          <div class="product-img-wrap">
            ${p.foto_url ? `<img src="${esc(p.foto_url)}" alt="">` : `<div class="product-img-placeholder">${p.categorias?.icone || '🌾'}</div>`}
            <span class="product-category-badge">${p.categorias?.icone || ''} ${esc(p.categorias?.nome || '')}</span>
          </div>
          <div class="product-body">
            <h3 class="product-name">${esc(p.nome)}</h3>
            ${p.descricao ? `<p class="product-desc">${esc(p.descricao)}</p>` : ''}
            <div class="product-price-row">
              <span class="product-price-value">${preco}</span>
              <span class="product-price-unit">/ ${esc(p.unidade || 'un')}</span>
            </div>
            <div class="product-producer-row">
              <span>👨‍🌾</span>
              <span class="producer-link">${esc(p.produtores?.nome || 'Produtor')}</span>
              ${p.produtores?.municipio ? `<span>· ${esc(p.produtores.municipio)}</span>` : ''}
            </div>
          </div>
          <div class="product-footer">
            ${whats !== '#' ? `<a href="${whats}" target="_blank" class="btn btn-primary btn-block" style="background:#25D366;border-color:#25D366;">📱 WhatsApp</a>` : ''}
          </div>
        </article>
      `;
    }).join('');
  }

  // --- RENDER: LOGIN / REGISTER / DASHBOARD / ADMIN ---
  function renderLogin() {
    if (state.user) { navigate('dashboard'); return; }
    renderAuth('login');
  }
  function renderRegister() {
    if (state.user) { navigate('dashboard'); return; }
    renderAuth('register');
  }

  function renderAuth(tab) {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div style="min-height:calc(100vh - 68px);display:flex;align-items:center;justify-content:center;padding:40px 20px;">
        <div style="background:white;border-radius:16px;box-shadow:0 16px 40px rgba(0,0,0,.1);padding:40px;width:100%;max-width:480px;border:1px solid #E8F5EF;">
          <div style="text-align:center;margin-bottom:24px;font-family:'Outfit',sans-serif;font-size:1.5rem;font-weight:700;color:#1B4332;">
            <span style="font-size:2.5rem;display:block;margin-bottom:6px;">🌾</span> Feira Digital da Roça
          </div>
          <div style="display:flex;margin-bottom:24px;border-radius:8px;overflow:hidden;border:1.5px solid #D1E7DD;">
            <button style="flex:1;padding:10px;font-weight:600;background:${tab==='login'?'#2D6A4F':'white'};color:${tab==='login'?'white':'#5E7A6B'};cursor:pointer;" onclick="window.location.hash='login'">Entrar</button>
            <button style="flex:1;padding:10px;font-weight:600;background:${tab==='register'?'#2D6A4F':'white'};color:${tab==='register'?'white':'#5E7A6B'};cursor:pointer;" onclick="window.location.hash='register'">Cadastrar</button>
          </div>
          ${tab==='login' ? `
            <form id="form-auth" style="display:flex;flex-direction:column;gap:16px;">
              <div class="form-group"><label class="form-label">E-mail</label><input class="form-control" id="l-email" type="email" required></div>
              <div class="form-group"><label class="form-label">Senha</label><input class="form-control" id="l-senha" type="password" required></div>
              <button class="btn btn-primary btn-block" type="submit">Entrar na conta</button>
            </form>
          ` : `
            <form id="form-auth" style="display:flex;flex-direction:column;gap:16px;">
              <div class="form-row">
                <div class="form-group"><label class="form-label">Nome completo</label><input class="form-control" id="r-nome" required></div>
                <div class="form-group"><label class="form-label">Município</label><input class="form-control" id="r-mun"></div>
              </div>
              <div class="form-row">
                <div class="form-group"><label class="form-label">E-mail</label><input class="form-control" id="r-email" type="email" required></div>
                <div class="form-group"><label class="form-label">WhatsApp</label><input class="form-control" id="r-whats" required></div>
              </div>
              <div class="form-group"><label class="form-label">Sobre sua produção</label><textarea class="form-control" id="r-desc" rows="2"></textarea></div>
              <div class="form-row">
                <div class="form-group"><label class="form-label">Senha</label><input class="form-control" id="r-senha" type="password" required minlength="6"></div>
                <div class="form-group"><label class="form-label">Confirmar senha</label><input class="form-control" id="r-conf" type="password" required></div>
              </div>
              <button class="btn btn-primary btn-block" type="submit">Criar minha conta</button>
            </form>
          `}
        </div>
      </div>
    `;

    document.getElementById('form-auth').addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        if (tab === 'login') {
          await doLogin(document.getElementById('l-email').value, document.getElementById('l-senha').value);
          toast('success', 'Bem-vindo!', 'Login efetuado.');
          navigate('dashboard');
        } else {
          const s1 = document.getElementById('r-senha').value;
          const s2 = document.getElementById('r-conf').value;
          if (s1 !== s2) { alert('As senhas não coincidem.'); return; }
          await doRegister({
            email: document.getElementById('r-email').value,
            senha: s1,
            nome: document.getElementById('r-nome').value,
            whatsapp: document.getElementById('r-whats').value,
            municipio: document.getElementById('r-mun').value,
            descricao: document.getElementById('r-desc').value
          });
          toast('success', 'Conta criada!', 'Aguarde aprovação do administrador.');
          navigate('login');
        }
      } catch (err) {
        toast('error', 'Erro', err.message);
      }
    });
  }

  async function renderDashboard() {
    if (!state.user) { navigate('login'); return; }
    const p = state.produtor;
    const app = document.getElementById('app');
    if (!p) { app.innerHTML = `<div style="padding:60px;text-align:center;"><div class="spinner"></div></div>`; return; }

    app.innerHTML = `
      <div class="dashboard-page">
        <div class="dashboard-container">
          ${p.status === 'pendente' ? '<div style="background:#FFFBEB;border:1px solid #FDE68A;padding:16px;border-radius:12px;margin-bottom:20px;color:#92400E;">⏳ <strong>Conta em análise.</strong> Aguardando aprovação do administrador.</div>' : ''}
          <div class="dashboard-header">
            <div class="dashboard-welcome">
              <h1>Olá, ${esc(p.nome)}! 👋</h1>
              <p>Gerencie os seus produtos na plataforma.</p>
            </div>
            ${p.status === 'ativo' ? '<button class="btn btn-primary" id="btn-new-prod">+ Novo produto</button>' : ''}
          </div>
          ${p.status === 'ativo' ? `
            <div class="products-table-wrap" style="margin-top:20px;">
              <table class="products-table">
                <thead><tr><th>Produto</th><th>Categoria</th><th>Preço</th><th>Status</th><th>Ações</th></tr></thead>
                <tbody id="dash-tbody"><tr><td colspan="5" style="text-align:center;padding:30px;"><div class="spinner"></div></td></tr></tbody>
              </table>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    if (p.status === 'ativo') {
      try {
        const { data: produtos } = await db.from('produtos').select('*, categorias(*)').eq('produtor_id', state.user.id).order('criado_em', { ascending: false });
        const tbody = document.getElementById('dash-tbody');
        if (!produtos.length) {
          tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:40px;color:#5E7A6B;">Nenhum produto cadastrado.</td></tr>`;
        } else {
          tbody.innerHTML = produtos.map(prod => `
            <tr>
              <td><strong>${esc(prod.nome)}</strong></td>
              <td>${prod.categorias?.icone || ''} ${esc(prod.categorias?.nome || '—')}</td>
              <td>R$ ${parseFloat(prod.preco).toFixed(2)} / ${esc(prod.unidade || 'un')}</td>
              <td><span class="badge ${prod.disponivel ? 'badge-green' : 'badge-gray'}">${prod.disponivel ? 'Disponível' : 'Indisponível'}</span></td>
              <td><button class="table-btn table-btn-delete dash-del" data-id="${prod.id}">🗑️ Excluir</button></td>
            </tr>
          `).join('');

          tbody.querySelectorAll('.dash-del').forEach(btn => {
            btn.addEventListener('click', async () => {
              if (!confirm('Excluir este produto?')) return;
              await db.from('produtos').delete().eq('id', btn.dataset.id);
              renderDashboard();
            });
          });
        }

        document.getElementById('btn-new-prod')?.addEventListener('click', () => openProdutoModal(null));
      } catch (e) { console.error(e); }
    }
  }

  async function openProdutoModal(produto) {
    const cats = await getCategorias();
    openModal(produto ? 'Editar Produto' : 'Novo Produto', `
      <form id="form-prod" style="display:flex;flex-direction:column;gap:14px;">
        <div class="form-group"><label class="form-label">Nome do produto</label><input class="form-control" id="p-nome" required value="${produto?esc(produto.nome):''}"></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Categoria</label><select class="form-control form-select" id="p-cat">${cats.map(c=>`<option value="${c.id}" ${produto?.categoria_id==c.id?'selected':''}>${c.icone} ${esc(c.nome)}</option>`).join('')}</select></div>
          <div class="form-group"><label class="form-label">Preço (R$)</label><input class="form-control" id="p-preco" type="number" step="0.01" required value="${produto?produto.preco:''}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Unidade</label><select class="form-control form-select" id="p-unidade"><option value="unidade">Unidade</option><option value="kg">Kg</option><option value="maço">Maço</option><option value="litro">Litro</option></select></div>
          <div class="form-group"><label class="form-label">Foto URL (Opcional)</label><input class="form-control" id="p-foto" placeholder="https://..." value="${produto?esc(produto.foto_url||''):''}"></div>
        </div>
        <div class="form-group"><label class="form-label">Descrição</label><textarea class="form-control" id="p-desc">${produto?esc(produto.descricao||''):''}</textarea></div>
      </form>
    `, [
      { label: 'Salvar produto', id: 'btn-save-prod', primary: true },
      { label: 'Cancelar', id: 'btn-cancel-modal', primary: false }
    ]);

    document.getElementById('btn-cancel-modal').addEventListener('click', closeModal);
    document.getElementById('btn-save-prod').addEventListener('click', async () => {
      try {
        await upsertProduto({
          id: produto?.id,
          nome: document.getElementById('p-nome').value,
          categoria_id: document.getElementById('p-cat').value,
          preco: parseFloat(document.getElementById('p-preco').value),
          unidade: document.getElementById('p-unidade').value,
          foto_url: document.getElementById('p-foto').value || null,
          descricao: document.getElementById('p-desc').value,
          disponivel: true
        });
        toast('success', 'Sucesso!', 'Produto salvo.');
        closeModal();
        renderDashboard();
      } catch (err) { toast('error', 'Erro', err.message); }
    });
  }

  async function renderAdmin() {
    if (!state.user || !state.produtor?.is_admin) { navigate(''); return; }
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="admin-page">
        <div class="admin-container">
          <h1>🛡️ Painel Administrativo</h1>
          <div class="tabs" style="margin-top:20px;">
            <button class="tab-btn active" data-tab="pendentes">⏳ Produtores Pendentes</button>
            <button class="tab-btn" data-tab="produtos">📦 Todos os Produtos (+ Novo)</button>
          </div>
          <div id="tab-pendentes" class="tab-panel active"><div class="spinner"></div></div>
          <div id="tab-produtos" class="tab-panel">
            <div style="display:flex;justify-content:flex-end;margin-bottom:16px;">
              <button class="btn btn-primary btn-sm" id="btn-admin-add">+ Novo Produto</button>
            </div>
            <div id="admin-produtos-list"><div class="spinner"></div></div>
          </div>
        </div>
      </div>
    `;

    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
      });
    });

    try {
      const [allP, allProd] = await Promise.all([getAllProdutores(), getAllProdutos()]);
      const pend = allP.filter(p => p.status === 'pendente');
      const pList = document.getElementById('tab-pendentes');
      pList.innerHTML = pend.length ? pend.map(p => `
        <div class="producer-approval-card">
          <div class="pcard-avatar">${p.nome[0]}</div>
          <div style="flex:1;"><strong>${esc(p.nome)}</strong><br><small>${esc(p.whatsapp)} · ${esc(p.municipio||'')}</small></div>
          <button class="btn btn-primary btn-sm admin-aprovar" data-id="${p.id}">Aprovar</button>
        </div>
      `).join('') : '<p style="color:#5E7A6B;">Nenhum produtor pendente.</p>';

      pList.querySelectorAll('.admin-aprovar').forEach(b => {
        b.addEventListener('click', async () => {
          await updateProdutorStatus(b.dataset.id, 'ativo');
          toast('success', 'Aprovado!', 'Produtor ativado.');
          renderAdmin();
        });
      });

      const prodList = document.getElementById('admin-produtos-list');
      prodList.innerHTML = `
        <div class="products-table-wrap">
          <table class="products-table">
            <thead><tr><th>Produto</th><th>Produtor</th><th>Preço</th><th>Ações</th></tr></thead>
            <tbody>
              ${allProd.map(pr => `
                <tr>
                  <td><strong>${esc(pr.nome)}</strong></td>
                  <td>${esc(pr.produtores?.nome||'—')}</td>
                  <td>R$ ${parseFloat(pr.preco).toFixed(2)}</td>
                  <td><button class="table-btn table-btn-delete admin-del" data-id="${pr.id}">Excluir</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      prodList.querySelectorAll('.admin-del').forEach(b => {
        b.addEventListener('click', async () => {
          if(!confirm('Excluir?')) return;
          await deleteProdutoAdmin(b.dataset.id);
          renderAdmin();
        });
      });

      document.getElementById('btn-admin-add').addEventListener('click', () => openProdutoModal(null));

    } catch (e) { console.error(e); }
  }

  function renderProducers() { document.getElementById('app').innerHTML = `<div class="container" style="padding:40px"><h1>Produtores</h1></div>`; }
  function renderProfileEdit() { document.getElementById('app').innerHTML = `<div class="container" style="padding:40px"><h1>Editar Perfil</h1></div>`; }
  function renderProducerProfile(id) { document.getElementById('app').innerHTML = `<div class="container" style="padding:40px"><h1>Perfil ${id}</h1></div>`; }

  function setupModal() {
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-overlay').addEventListener('click', (e) => { if (e.target === document.getElementById('modal-overlay')) closeModal(); });
  }
  function openModal(title, body, buttons) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = body;
    document.getElementById('modal-footer').innerHTML = buttons.map(b => `<button class="btn ${b.primary?'btn-primary':'btn-ghost'}" id="${b.id}">${b.label}</button>`).join('');
    document.getElementById('modal-overlay').classList.remove('hidden');
  }
  function closeModal() { document.getElementById('modal-overlay').classList.add('hidden'); }
  function toast(type, title, message) {
    const id = 't-' + Date.now();
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.id = id;
    el.innerHTML = `<div style="flex:1"><div class="toast-title">${esc(title)}</div><div class="toast-message">${esc(message)}</div></div>`;
    document.getElementById('toast-container').appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }
  function hideLoading() { document.getElementById('loading-screen')?.classList.add('fade-out'); setTimeout(()=>document.getElementById('loading-screen')?.remove(), 500); }
  function esc(s) { return s ? String(s).replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''; }
  function getWhatsAppUrl(whats, prod) {
    if (!whats) return '#';
    const num = String(whats).replace(/\D/g, '');
    const msg = encodeURIComponent(`Olá! Vi o produto *${prod}* na Feira Digital da Roça.`);
    return `https://wa.me/55${num}?text=${msg}`;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
