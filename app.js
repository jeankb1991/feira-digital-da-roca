/* ============================================================
   MARKETPLACE RURAL: AGRICULTURA FAMILIAR
   CETI Malaquias Ribeiro Damasceno — São Lourenço do Piauí, PI
   Plataforma Web para Venda Direta de Produtos da Agricultura Familiar
   Tecnologias: HTML5, CSS3, JavaScript SPA, Supabase & GitHub Pages
   ============================================================ */

(function () {
  'use strict';

  // ============================================================
  // 1. ESTADO GLOBAL DA APLICAÇÃO
  // ============================================================
  let db = null;

  const state = {
    isDemo: false,
    user: null,
    produtor: null,
    categorias: [],
    catalogFilters: {
      busca: '',
      categoria_id: null,
      produtor_id: null,
      apenasFavoritos: false,
      ordem: 'recentes',
    },
  };

  // Dados iniciais de demonstração (baseados em São Lourenço do Piauí)
  const SEED_DATA = {
    categorias: [
      { id: 1, nome: 'Hortaliças',  icone: '🥬', cor: '#52B788' },
      { id: 2, nome: 'Frutas',      icone: '🍎', cor: '#F4A261' },
      { id: 3, nome: 'Laticínios',  icone: '🥛', cor: '#4895EF' },
      { id: 4, nome: 'Artesanato',  icone: '🧵', cor: '#E76F51' },
      { id: 5, nome: 'Outros',      icone: '🌾', cor: '#2D6A4F' }
    ],
    produtores: [
      {
        id: 'demo-prod-1',
        nome: 'Dona Maria da Horta',
        email: 'maria.horta@roca.local',
        whatsapp: '89999112233',
        municipio: 'São Lourenço do Piauí - PI',
        descricao: 'Cultivo agroecológico familiar de hortaliças frescas colhidas diariamente sem uso de agrotóxicos.',
        status: 'ativo',
        is_admin: false,
        criado_em: new Date(Date.now() - 86400000 * 10).toISOString()
      },
      {
        id: 'demo-prod-2',
        nome: 'Seu Raimundo do Mel',
        email: 'raimundo.mel@roca.local',
        whatsapp: '89999223344',
        municipio: 'São Lourenço do Piauí - PI',
        descricao: 'Apicultura familiar no semiárido piauiense. Mel 100% puro e floradas silvestres de marmeleiro e jurema.',
        status: 'ativo',
        is_admin: false,
        criado_em: new Date(Date.now() - 86400000 * 8).toISOString()
      },
      {
        id: 'demo-prod-3',
        nome: 'Chico do Queijo & Leite',
        email: 'chico.queijo@roca.local',
        whatsapp: '89999334455',
        municipio: 'São Lourenço do Piauí - PI',
        descricao: 'Produção artesanal diária de queijo coalho e manteiga da terra de gado criado solto na caatinga.',
        status: 'ativo',
        is_admin: false,
        criado_em: new Date(Date.now() - 86400000 * 5).toISOString()
      },
      {
        id: 'demo-prod-4',
        nome: 'Dona Isabel do Artesanato',
        email: 'isabel.artesanato@roca.local',
        whatsapp: '89999445566',
        municipio: 'São Lourenço do Piauí - PI',
        descricao: 'Peças exclusivas feitas à mão com palha de carnaúba, crochê e bordados tradicionais da região.',
        status: 'ativo',
        is_admin: false,
        criado_em: new Date(Date.now() - 86400000 * 3).toISOString()
      },
      {
        id: 'demo-admin',
        nome: 'Prof. Jean Santana (Admin)',
        email: 'admin@ceti.pi.gov.br',
        whatsapp: '89999000000',
        municipio: 'São Lourenço do Piauí - PI',
        descricao: 'Coordenação e Administração da Plataforma Feira Digital da Roça - CETI Malaquias Ribeiro Damasceno.',
        status: 'ativo',
        is_admin: true,
        criado_em: new Date().toISOString()
      }
    ],
    produtos: [
      {
        id: 1,
        produtor_id: 'demo-prod-1',
        categoria_id: 1,
        nome: 'Alface Crespa Agroecológica',
        descricao: 'Colhida na hora da entrega, folha tenra e sem agrotóxicos. Produção comunitária.',
        preco: 3.50,
        unidade: 'maço',
        foto_url: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&w=600&q=80',
        disponivel: true,
        criado_em: new Date(Date.now() - 86400000 * 3).toISOString()
      },
      {
        id: 2,
        produtor_id: 'demo-prod-1',
        categoria_id: 1,
        nome: 'Cheiro-Verde (Coentro e Cebolinha)',
        descricao: 'Maço farto de coentro e cebolinha verdinhos para o melhor tempero da culinária piauiense.',
        preco: 2.50,
        unidade: 'maço',
        foto_url: 'https://images.unsplash.com/photo-1592417817098-8f3d69109853?auto=format&fit=crop&w=600&q=80',
        disponivel: true,
        criado_em: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: 3,
        produtor_id: 'demo-prod-1',
        categoria_id: 2,
        nome: 'Goiaba Vermelha Regional',
        descricao: 'Frutas doces e carnudas, excelentes para suco natural ou compota caseira.',
        preco: 6.00,
        unidade: 'kg',
        foto_url: 'https://images.unsplash.com/photo-1536511136777-2272895690b2?auto=format&fit=crop&w=600&q=80',
        disponivel: true,
        criado_em: new Date(Date.now() - 86400000 * 4).toISOString()
      },
      {
        id: 4,
        produtor_id: 'demo-prod-2',
        categoria_id: 5,
        nome: 'Mel Puro Silvestre do Semiárido',
        descricao: 'Garrafa de 500ml de mel 100% puro colhido em floradas de jurema e marmeleiro.',
        preco: 25.00,
        unidade: 'garrafa 500ml',
        foto_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
        disponivel: true,
        criado_em: new Date(Date.now() - 86400000 * 5).toISOString()
      },
      {
        id: 5,
        produtor_id: 'demo-prod-3',
        categoria_id: 3,
        nome: 'Queijo Coalho Tradicional do Sertão',
        descricao: 'Queijo curado na medida certa para assar na brasa ou na chapa. Feito com leite cru fresco.',
        preco: 32.00,
        unidade: 'kg',
        foto_url: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=600&q=80',
        disponivel: true,
        criado_em: new Date(Date.now() - 86400000 * 1).toISOString()
      },
      {
        id: 6,
        produtor_id: 'demo-prod-3',
        categoria_id: 3,
        nome: 'Manteiga da Terra Caipira',
        descricao: 'Manteiga de garrafa aromática cozida em tacho de ferro tradicional.',
        preco: 18.00,
        unidade: 'pote 300g',
        foto_url: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=600&q=80',
        disponivel: true,
        criado_em: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: 7,
        produtor_id: 'demo-prod-4',
        categoria_id: 4,
        nome: 'Cesto Trançado em Palha de Carnaúba',
        descricao: 'Cesto decorativo e utilitário, resistente e trançado manualmente com palha nativa.',
        preco: 45.00,
        unidade: 'unidade',
        foto_url: 'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?auto=format&fit=crop&w=600&q=80',
        disponivel: true,
        criado_em: new Date(Date.now() - 86400000 * 6).toISOString()
      }
    ]
  };

  // ============================================================
  // 2. GERENCIADOR DE FAVORITOS (RF08)
  // ============================================================
  const Favorites = {
    KEY: 'FEIRA_FAVORITOS',
    getAll() {
      try {
        const raw = localStorage.getItem(this.KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    },
    has(id) {
      const list = this.getAll();
      return list.includes(Number(id)) || list.includes(String(id));
    },
    toggle(id) {
      let list = this.getAll();
      const numId = Number(id);
      const strId = String(id);
      const idx = list.findIndex(item => item === numId || item === strId);
      let added = false;
      if (idx >= 0) {
        list.splice(idx, 1);
        added = false;
      } else {
        list.push(numId || strId);
        added = true;
      }
      try {
        localStorage.setItem(this.KEY, JSON.stringify(list));
      } catch (e) {
        console.warn('Erro ao salvar favoritos:', e);
      }
      this.updateBadges();
      return added;
    },
    updateBadges() {
      const count = this.getAll().length;
      const badges = document.querySelectorAll('.badge-fav');
      badges.forEach(b => {
        b.textContent = count;
        b.style.display = count > 0 ? 'inline-block' : 'none';
      });
    }
  };

  // ============================================================
  // 2.1 GERENCIADOR DO CARRINHO DE COMPRAS (SHOPPING CART)
  // ============================================================
  const Cart = {
    KEY: 'FEIRA_CARRINHO',
    getItems() {
      try {
        const raw = localStorage.getItem(this.KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    },
    save(items) {
      try {
        localStorage.setItem(this.KEY, JSON.stringify(items));
      } catch (e) {
        console.warn('Erro ao salvar carrinho:', e);
      }
      this.updateBadges();
      renderCartDrawer();
    },
    getItem(produtoId) {
      const items = this.getItems();
      return items.find(i => String(i.id) === String(produtoId));
    },
    addItem(produto, quantidade = 1) {
      let items = this.getItems();
      const existing = items.find(i => String(i.id) === String(produto.id));
      if (existing) {
        existing.quantidade += quantidade;
      } else {
        items.push({
          id: produto.id,
          nome: produto.nome,
          preco: Number(produto.preco),
          unidade: produto.unidade || 'unidade',
          foto_url: produto.foto_url || null,
          categoria_nome: produto.categorias?.nome || 'Geral',
          categoria_icone: produto.categorias?.icone || '🌾',
          produtor_id: produto.produtor_id,
          produtor_nome: produto.produtores?.nome || 'Produtor Rural',
          produtor_whatsapp: produto.produtores?.whatsapp || '',
          produtor_municipio: produto.produtores?.municipio || 'São Lourenço do Piauí',
          quantidade: Math.max(1, quantidade)
        });
      }
      this.save(items);
      toast('success', '🛒 Adicionado à Cesta', `${produto.nome} (${quantidade}x) na sua cesta.`);
      updateCardsCartState();
    },
    updateQty(produtoId, delta) {
      let items = this.getItems();
      const idx = items.findIndex(i => String(i.id) === String(produtoId));
      if (idx >= 0) {
        items[idx].quantidade += delta;
        if (items[idx].quantidade <= 0) {
          items.splice(idx, 1);
        }
        this.save(items);
        updateCardsCartState();
      }
    },
    removeItem(produtoId) {
      let items = this.getItems();
      items = items.filter(i => String(i.id) !== String(produtoId));
      this.save(items);
      updateCardsCartState();
      toast('info', 'Removido', 'Item removido da cesta de compras.');
    },
    clear() {
      this.save([]);
      updateCardsCartState();
      toast('info', 'Cesta limpa', 'Todos os itens foram removidos da cesta.');
    },
    getTotalCount() {
      return this.getItems().reduce((acc, item) => acc + item.quantidade, 0);
    },
    getTotalPrice() {
      return this.getItems().reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
    },
    getGroupByProducer() {
      const items = this.getItems();
      const groups = {};
      items.forEach(item => {
        const pid = item.produtor_id || 'geral';
        if (!groups[pid]) {
          groups[pid] = {
            produtor_id: pid,
            nome: item.produtor_nome,
            whatsapp: item.produtor_whatsapp,
            municipio: item.produtor_municipio,
            items: [],
            total: 0
          };
        }
        groups[pid].items.push(item);
        groups[pid].total += item.preco * item.quantidade;
      });
      return Object.values(groups);
    },
    updateBadges() {
      const count = this.getTotalCount();
      const badges = document.querySelectorAll('.badge-cart');
      badges.forEach(b => {
        b.textContent = count;
      });

      const fab = document.getElementById('cart-floating-fab');
      if (fab) {
        if (count > 0) {
          fab.classList.remove('hidden');
          const totalFmt = this.getTotalPrice().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
          const textEl = document.getElementById('fab-cart-text');
          if (textEl) textEl.textContent = `Cesta (${count}) · ${totalFmt}`;
        } else {
          fab.classList.add('hidden');
        }
      }
    }
  };

  // ============================================================
  // 3. PERSISTÊNCIA DO MODO DEMONSTRAÇÃO
  // ============================================================
  const DemoStorage = {
    PRODUTOS_KEY: 'FEIRA_DEMO_PRODUTOS',
    PRODUTORES_KEY: 'FEIRA_DEMO_PRODUTORES',

    getProdutos() {
      try {
        const raw = localStorage.getItem(this.PRODUTOS_KEY);
        if (raw) return JSON.parse(raw);
      } catch (e) {}
      localStorage.setItem(this.PRODUTOS_KEY, JSON.stringify(SEED_DATA.produtos));
      return [...SEED_DATA.produtos];
    },
    saveProdutos(list) {
      localStorage.setItem(this.PRODUTOS_KEY, JSON.stringify(list));
    },
    getProdutores() {
      try {
        const raw = localStorage.getItem(this.PRODUTORES_KEY);
        if (raw) return JSON.parse(raw);
      } catch (e) {}
      localStorage.setItem(this.PRODUTORES_KEY, JSON.stringify(SEED_DATA.produtores));
      return [...SEED_DATA.produtores];
    },
    saveProdutores(list) {
      localStorage.setItem(this.PRODUTORES_KEY, JSON.stringify(list));
    },
    reset() {
      localStorage.removeItem(this.PRODUTOS_KEY);
      localStorage.removeItem(this.PRODUTORES_KEY);
    }
  };

  // ============================================================
  // 4. INICIALIZAÇÃO E CONEXÃO SUPABASE
  // ============================================================
  function isSupabaseConfigured() {
    const url = window.localStorage.getItem('FEIRA_SUPABASE_URL') || (typeof SUPABASE_URL !== 'undefined' ? SUPABASE_URL : '');
    const key = window.localStorage.getItem('FEIRA_SUPABASE_KEY') || (typeof SUPABASE_KEY !== 'undefined' ? SUPABASE_KEY : '');
    return (
      Boolean(url) &&
      Boolean(key) &&
      !url.includes('SEU_PROJETO') &&
      !key.includes('SUA_ANON_KEY')
    );
  }

  async function initSupabase() {
    if (!isSupabaseConfigured()) {
      activateDemoMode('Modo Demonstração ativado (Supabase ainda não configurado)');
      return false;
    }

    try {
      const url = window.localStorage.getItem('FEIRA_SUPABASE_URL') || SUPABASE_URL;
      const key = window.localStorage.getItem('FEIRA_SUPABASE_KEY') || SUPABASE_KEY;

      const { createClient } = window.supabase;
      db = createClient(url, key, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          flowType: 'pkce',
        }
      });

      // Teste rápido de conectividade com a tabela de categorias
      const { data, error } = await db.from('categorias').select('id').limit(1);
      if (error && error.code !== 'PGRST116') {
        console.warn('Supabase acessível com aviso:', error.message);
      }
      
      state.isDemo = false;
      updateConnectionBadge(true);
      return true;
    } catch (e) {
      console.warn('Falha ao conectar no Supabase. Alternando para modo demonstração:', e.message);
      activateDemoMode('Conexão com Supabase indisponível no momento. Modo Demonstração ativo.');
      return false;
    }
  }

  function activateDemoMode(reason) {
    state.isDemo = true;
    updateConnectionBadge(false);
    if (reason) console.info(reason);
  }

  function updateConnectionBadge(isOnline) {
    const btn = document.getElementById('btn-status-conexao');
    const icon = document.getElementById('status-icon');
    const text = document.getElementById('status-text');
    if (!btn || !icon || !text) return;

    if (isOnline) {
      btn.className = 'badge-connection online';
      icon.textContent = '🟢';
      text.textContent = 'Supabase Conectado';
      btn.title = 'Conectado ao Supabase na nuvem. Clique para ver detalhes.';
    } else {
      btn.className = 'badge-connection demo';
      icon.textContent = '🌱';
      text.textContent = 'Modo Demonstração';
      btn.title = 'Executando em modo demonstração local. Clique para conectar seu Supabase.';
    }
  }

  // ============================================================
  // 5. INICIALIZAÇÃO DA APLICAÇÃO
  // ============================================================
  async function init() {
    setupNavbar();
    setupModal();
    setupCartDrawer();
    Favorites.updateBadges();
    Cart.updateBadges();

    const ok = await initSupabase();

    if (ok && db) {
      // Verificar sessão existente no Supabase Auth
      try {
        const { data: { session } } = await db.auth.getSession();
        if (session) await onLogin(session.user, false);
      } catch (e) {
        console.warn('Erro ao verificar sessão:', e.message);
      }

      // Escutar mudanças de autenticação
      db.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) await onLogin(session.user, false);
        if (event === 'SIGNED_OUT') await onLogout();
        if (event === 'TOKEN_REFRESHED' && session) state.user = session.user;
      });
    } else {
      // No modo Demo, verificar se havia usuário logado no localStorage
      const demoUser = localStorage.getItem('FEIRA_DEMO_USER');
      if (demoUser) {
        try {
          const u = JSON.parse(demoUser);
          state.user = { id: u.id, email: u.email };
          state.produtor = u;
          updateNavbarAuth();
        } catch (e) {}
      }
    }

    hideLoading();

    // Roteador SPA baseado em Hash
    window.addEventListener('hashchange', router);
    router();
  }

  function hideLoading() {
    const ls = document.getElementById('loading-screen');
    if (ls) {
      ls.classList.add('fade-out');
      setTimeout(() => ls.remove(), 600);
    }
  }

  // ============================================================
  // 6. CAMADA DE DADOS UNIFICADA (Supabase / Modo Demo)
  // ============================================================
  async function getCategorias() {
    if (state.categorias.length) return state.categorias;
    if (state.isDemo || !db) {
      state.categorias = SEED_DATA.categorias;
      return state.categorias;
    }
    try {
      const { data, error } = await db.from('categorias').select('*').order('id');
      if (error) throw error;
      state.categorias = (data && data.length) ? data : SEED_DATA.categorias;
      return state.categorias;
    } catch (e) {
      return SEED_DATA.categorias;
    }
  }

  async function getProdutos(filters = {}) {
    if (state.isDemo || !db) {
      let produtos = DemoStorage.getProdutos();
      const produtores = DemoStorage.getProdutores();
      const categorias = await getCategorias();

      // Relacionar com produtor e categoria
      produtos = produtos.map(p => {
        const prod = produtores.find(pr => pr.id === p.produtor_id);
        const cat = categorias.find(c => c.id === p.categoria_id);
        return {
          ...p,
          produtores: prod || { nome: 'Produtor Rural', whatsapp: '', municipio: 'São Lourenço do Piauí' },
          categorias: cat || { nome: 'Outros', icone: '🌾' }
        };
      });

      // Filtro de produtor ativo (produtores bloqueados não aparecem no catálogo)
      produtos = produtos.filter(p => !p.produtores || p.produtores.status === 'ativo');

      if (filters.categoria_id) {
        produtos = produtos.filter(p => Number(p.categoria_id) === Number(filters.categoria_id));
      }
      if (filters.produtor_id) {
        produtos = produtos.filter(p => String(p.produtor_id) === String(filters.produtor_id));
      }
      if (filters.busca) {
        const q = filters.busca.toLowerCase();
        produtos = produtos.filter(p => p.nome.toLowerCase().includes(q) || (p.descricao && p.descricao.toLowerCase().includes(q)));
      }
      if (filters.apenasFavoritos) {
        produtos = produtos.filter(p => Favorites.has(p.id));
      }
      if (!filters.showAll) {
        produtos = produtos.filter(p => p.disponivel !== false);
      }
      return produtos;
    }

    // Modo Supabase Nuvem
    let query = db
      .from('produtos')
      .select('*, produtores(*), categorias(*)')
      .order('criado_em', { ascending: false });

    if (filters.categoria_id) query = query.eq('categoria_id', filters.categoria_id);
    if (filters.produtor_id)  query = query.eq('produtor_id',  filters.produtor_id);
    if (filters.busca)        query = query.ilike('nome', `%${filters.busca}%`);
    if (!filters.showAll)     query = query.eq('disponivel', true);

    const { data, error } = await query;
    if (error) throw error;
    
    let list = data || [];
    if (filters.apenasFavoritos) {
      list = list.filter(p => Favorites.has(p.id));
    }
    return list;
  }

  async function getMeusProdutos() {
    if (!state.user) return [];
    if (state.isDemo || !db) {
      const produtos = DemoStorage.getProdutos();
      const categorias = await getCategorias();
      return produtos
        .filter(p => String(p.produtor_id) === String(state.user.id))
        .map(p => ({
          ...p,
          categorias: categorias.find(c => c.id === p.categoria_id) || { nome: 'Outros', icone: '🌾' }
        }));
    }
    const { data, error } = await db
      .from('produtos')
      .select('*, categorias(*)')
      .eq('produtor_id', state.user.id)
      .order('criado_em', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async function getProdutores() {
    if (state.isDemo || !db) {
      return DemoStorage.getProdutores().filter(p => p.status === 'ativo');
    }
    const { data, error } = await db
      .from('produtores')
      .select('*')
      .eq('status', 'ativo')
      .order('nome');
    if (error) throw error;
    return data || [];
  }

  async function getProdutorById(id) {
    if (state.isDemo || !db) {
      return DemoStorage.getProdutores().find(p => String(p.id) === String(id));
    }
    const { data, error } = await db.from('produtores').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }

  async function getAllProdutores() {
    if (state.isDemo || !db) {
      return DemoStorage.getProdutores();
    }
    const { data, error } = await db.from('produtores').select('*').order('criado_em', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async function getAllProdutos() {
    if (state.isDemo || !db) {
      const produtos = DemoStorage.getProdutos();
      const produtores = DemoStorage.getProdutores();
      const categorias = await getCategorias();
      return produtos.map(p => ({
        ...p,
        produtores: produtores.find(pr => pr.id === p.produtor_id),
        categorias: categorias.find(c => c.id === p.categoria_id)
      }));
    }
    const { data, error } = await db
      .from('produtos')
      .select('*, produtores(*), categorias(*)')
      .order('criado_em', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async function upsertProduto(produto) {
    if (!state.user) throw new Error('Usuário não autenticado.');
    const precoNum = Number(produto.preco);
    if (isNaN(precoNum) || precoNum <= 0) {
      throw new Error('O preço do produto deve ser maior que zero (R$ 0,00).');
    }

    if (state.isDemo || !db) {
      const produtos = DemoStorage.getProdutos();
      if (produto.id) {
        const idx = produtos.findIndex(p => p.id === produto.id);
        if (idx >= 0) {
          produtos[idx] = { ...produtos[idx], ...produto, preco: precoNum };
          DemoStorage.saveProdutos(produtos);
          return produtos[idx];
        }
      } else {
        const novo = {
          ...produto,
          id: Date.now(),
          produtor_id: state.user.id,
          preco: precoNum,
          disponivel: produto.disponivel !== undefined ? produto.disponivel : true,
          criado_em: new Date().toISOString()
        };
        produtos.unshift(novo);
        DemoStorage.saveProdutos(produtos);
        return novo;
      }
    }

    // Supabase
    const payload = { ...produto, preco: precoNum, produtor_id: state.user.id };
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

  async function deleteProduto(id) {
    if (state.isDemo || !db) {
      const produtos = DemoStorage.getProdutos().filter(p => String(p.id) !== String(id));
      DemoStorage.saveProdutos(produtos);
      return;
    }
    const { error } = await db.from('produtos').delete().eq('id', id);
    if (error) throw error;
  }

  async function updateProdutor(fields) {
    if (!state.user) throw new Error('Usuário não autenticado.');
    if (state.isDemo || !db) {
      const produtores = DemoStorage.getProdutores();
      const idx = produtores.findIndex(p => p.id === state.user.id);
      if (idx >= 0) {
        produtores[idx] = { ...produtores[idx], ...fields };
        DemoStorage.saveProdutores(produtores);
        state.produtor = produtores[idx];
        localStorage.setItem('FEIRA_DEMO_USER', JSON.stringify(state.produtor));
        updateNavbarAuth();
      }
      return;
    }
    const { error } = await db.from('produtores').update(fields).eq('id', state.user.id);
    if (error) throw error;
    state.produtor = { ...state.produtor, ...fields };
    updateNavbarAuth();
  }

  async function updateProdutorStatus(id, status) {
    if (state.isDemo || !db) {
      const produtores = DemoStorage.getProdutores();
      const idx = produtores.findIndex(p => p.id === id);
      if (idx >= 0) {
        produtores[idx].status = status;
        DemoStorage.saveProdutores(produtores);
      }
      return;
    }
    const { error } = await db.from('produtores').update({ status }).eq('id', id);
    if (error) throw error;
  }

  async function deleteProdutoAdmin(id) {
    return deleteProduto(id);
  }

  async function uploadFoto(file) {
    if (file.size > 5 * 1024 * 1024) throw new Error('Foto muito grande. Máximo permitido: 5MB.');

    if (state.isDemo || !db) {
      // Em modo demonstração, converte para Data URL para salvar em memória
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = () => reject(new Error('Erro ao ler imagem localmente'));
        reader.readAsDataURL(file);
      });
    }

    const ext = file.name.split('.').pop().toLowerCase();
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await db.storage.from('fotos').upload(name, file, { upsert: false, contentType: file.type });
    if (error) throw error;
    const { data } = db.storage.from('fotos').getPublicUrl(name);
    return data.publicUrl;
  }

  async function doRegister(formData) {
    const { email, senha, ...perfil } = formData;

    if (state.isDemo || !db) {
      const produtores = DemoStorage.getProdutores();
      if (produtores.some(p => p.email && p.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('Este e-mail já está cadastrado.');
      }
      const novoProdutor = {
        id: 'demo-user-' + Date.now(),
        email,
        ...perfil,
        status: 'ativo',
        is_admin: false,
        criado_em: new Date().toISOString()
      };
      produtores.push(novoProdutor);
      DemoStorage.saveProdutores(produtores);
      state.user = { id: novoProdutor.id, email: novoProdutor.email };
      state.produtor = novoProdutor;
      localStorage.setItem('FEIRA_DEMO_USER', JSON.stringify(novoProdutor));
      updateNavbarAuth();
      return state.user;
    }

    // Registro Supabase
    const { data: authData, error: authErr } = await db.auth.signUp({
      email,
      password: senha,
      options: {
        data: {
          nome: perfil.nome,
          whatsapp: perfil.whatsapp,
          municipio: perfil.municipio,
          descricao: perfil.descricao
        }
      }
    });
    if (authErr) throw authErr;
    if (!authData.user) throw new Error('Falha ao criar usuário.');

    // Inserção ou atualização do perfil (com fallback de segurança)
    try {
      await db.from('produtores').upsert({
        id: authData.user.id,
        ...perfil,
        status: 'ativo',
        is_admin: false
      });
    } catch (e) {
      console.warn('Trigger automático cuidou da inserção do perfil:', e.message);
    }

    return authData.user;
  }

  async function doLogin(email, senha) {
    if (state.isDemo || !db) {
      const produtores = DemoStorage.getProdutores();
      const p = produtores.find(item => item.email && item.email.toLowerCase() === email.toLowerCase());
      if (p) {
        state.user = { id: p.id, email: p.email };
        state.produtor = p;
        localStorage.setItem('FEIRA_DEMO_USER', JSON.stringify(p));
        updateNavbarAuth();
        return state.user;
      }
      // Se não encontrou por e-mail exato em demo, mas o usuário digitou admin
      if (email.toLowerCase().includes('admin')) {
        const admin = produtores.find(pr => pr.is_admin);
        if (admin) {
          state.user = { id: admin.id, email: admin.email };
          state.produtor = admin;
          localStorage.setItem('FEIRA_DEMO_USER', JSON.stringify(admin));
          updateNavbarAuth();
          return state.user;
        }
      }
      throw new Error('Credenciais inválidas. Em modo Demo, use qualquer um dos e-mails sugeridos na tela.');
    }

    const { data, error } = await db.auth.signInWithPassword({ email, password: senha });
    if (error) throw error;
    return data.user;
  }

  // ============================================================
  // 7. AUTENTICAÇÃO E SESSÃO
  // ============================================================
  async function onLogin(user, navigateHome = true) {
    state.user = user;
    try {
      if (db) {
        const { data, error } = await db.from('produtores').select('*').eq('id', user.id).single();
        if (!error && data) {
          state.produtor = data;
        }
      }
    } catch (e) {
      console.warn('Produtor não encontrado:', e.message);
    }
    updateNavbarAuth();
    if (navigateHome) navigate('dashboard');
  }

  async function onLogout() {
    state.user = null;
    state.produtor = null;
    localStorage.removeItem('FEIRA_DEMO_USER');
    updateNavbarAuth();
    navigate('');
  }

  // ============================================================
  // 8. ROTEADOR (Hash SPA)
  // ============================================================
  function router() {
    const hash = window.location.hash.replace('#', '') || '';
    const parts = hash.split('/');
    const route = parts[0];
    const param = parts[1];

    closeMobileMenu();

    const routes = {
      '': renderCatalog,
      'catalog': renderCatalog,
      'favorites': renderFavorites,
      'cart': () => { openCartDrawer(); renderCatalog(); },
      'producers': renderProducers,
      'login': renderLogin,
      'register': renderRegister,
      'dashboard': renderDashboard,
      'admin': renderAdmin,
      'profile-edit': renderProfileEdit,
    };

    if (route === 'producer' && param) return renderProducerProfile(param);
    if (typeof routes[route] === 'function') return routes[route]();
    renderCatalog();
  }

  function navigate(hash) {
    window.location.hash = hash;
  }

  // ============================================================
  // 9. NAVBAR E CONTROLES
  // ============================================================
  function setupNavbar() {
    window.addEventListener('scroll', () => {
      document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });

    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('hidden', !isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
    });

    mobileMenu.querySelectorAll('a, button').forEach(el => {
      el.addEventListener('click', closeMobileMenu);
    });

    const avatarBtn = document.getElementById('user-avatar-btn');
    const userArea = document.getElementById('user-area');
    avatarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userArea.classList.toggle('open');
    });
    document.addEventListener('click', () => userArea.classList.remove('open'));

    // Botão de conexão
    document.getElementById('btn-status-conexao').addEventListener('click', openConnectionModal);

    // Logout
    document.getElementById('btn-logout').addEventListener('click', doLogout);
    document.getElementById('mobile-logout').addEventListener('click', doLogout);

    async function doLogout() {
      try {
        if (db && !state.isDemo) {
          await db.auth.signOut();
        } else {
          await onLogout();
        }
        toast('success', 'Até logo!', 'Você saiu da sua conta.');
      } catch (e) {
        toast('error', 'Erro ao sair', e.message);
      }
    }

    window.addEventListener('hashchange', updateNavActive);
    updateNavActive();
  }

  function closeMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    if (!hamburger || !mobileMenu) return;
    hamburger.classList.remove('open');
    mobileMenu.classList.add('hidden');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  function updateNavActive() {
    const hash = window.location.hash.replace('#', '');
    document.querySelectorAll('.nav-link').forEach(l => {
      const href = l.getAttribute('href').replace('#', '');
      l.classList.toggle('active', href === hash || (href === 'catalog' && hash === ''));
    });
  }

  function updateNavbarAuth() {
    const p = state.produtor;
    const isLogged = !!state.user;

    document.getElementById('guest-buttons').classList.toggle('hidden', isLogged);
    document.getElementById('user-area').classList.toggle('hidden', !isLogged);
    document.getElementById('mobile-guest').classList.toggle('hidden', isLogged);
    document.getElementById('mobile-user').classList.toggle('hidden', !isLogged);

    if (isLogged && p) {
      const initials = (p.nome || 'U').split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2);
      document.getElementById('avatar-initials').textContent = initials;
      document.getElementById('dropdown-name').textContent = p.nome;
      document.getElementById('dropdown-role').textContent = p.is_admin ? '🛡️ Administrador' : '👨‍🌾 Produtor';

      document.getElementById('link-admin').classList.toggle('hidden', !p.is_admin);
      document.getElementById('mobile-admin-link').classList.toggle('hidden', !p.is_admin);
    }
  }

  // ============================================================
  // 10. MODAL DE CONEXÃO DO SUPABASE
  // ============================================================
  function openConnectionModal() {
    const curUrl = window.localStorage.getItem('FEIRA_SUPABASE_URL') || (typeof SUPABASE_URL !== 'undefined' ? SUPABASE_URL : '');
    const curKey = window.localStorage.getItem('FEIRA_SUPABASE_KEY') || (typeof SUPABASE_KEY !== 'undefined' ? SUPABASE_KEY : '');
    const isConfig = isSupabaseConfigured();

    openModal({
      title: '⚙️ Configuração de Hospedagem & Supabase',
      content: `
        <div style="font-size:0.95rem;line-height:1.6;color:var(--text);">
          <div style="margin-bottom:16px;padding:12px;border-radius:10px;background:${isConfig ? '#DCFCE7' : '#FEF3C7'};border:1px solid ${isConfig ? '#A7F3C0' : '#FDE68A'}">
            <strong>Status Atual:</strong> ${isConfig ? '🟢 Supabase Configurado' : '🌱 Executando em Modo Demonstração'}
            <p style="margin-top:4px;font-size:0.85rem;color:var(--text-muted);">
              ${isConfig ? 'Os dados são salvos e sincronizados diretamente no seu banco de dados PostgreSQL do Supabase.' : 'Neste modo, você pode navegar, cadastrar produtos e testar tudo localmente sem precisar de credenciais.'}
            </p>
          </div>

          <form id="form-config-supabase" style="display:flex;flex-direction:column;gap:12px">
            <div>
              <label class="form-label" for="cfg-url">Supabase Project URL</label>
              <input class="form-control" id="cfg-url" type="url" placeholder="https://seu-projeto.supabase.co" value="${esc(curUrl.includes('SEU_PROJETO') ? '' : curUrl)}">
              <span style="font-size:0.75rem;color:var(--text-muted)">Encontrada no painel Supabase: Project Settings → API</span>
            </div>

            <div>
              <label class="form-label" for="cfg-key">Supabase anon public key</label>
              <input class="form-control" id="cfg-key" type="password" placeholder="eyJhbGciOiJIUzI1NiIsIn..." value="${esc(curKey.includes('SUA_ANON_KEY') ? '' : curKey)}">
              <span style="font-size:0.75rem;color:var(--text-muted)">Chave anônima pública (segura para uso no navegador).</span>
            </div>

            <div style="display:flex;gap:10px;margin-top:10px;flex-wrap:wrap;">
              <button type="submit" class="btn btn-primary" style="flex:1">💾 Salvar Conexão</button>
              <button type="button" id="btn-toggle-demo" class="btn btn-outline" style="flex:1">🌱 Ativar Modo Demo</button>
            </div>
          </form>

          <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border);font-size:0.85rem;color:var(--text-muted)">
            <strong>💡 Dica do Projeto Integrador:</strong>
            Para hospedar no GitHub Pages com Supabase, basta fazer commit de <code>config.js</code> ou salvar as chaves acima. Todos os dados permanecem salvos em nuvem de forma gratuita!
          </div>
        </div>
      `
    });

    const form = document.getElementById('form-config-supabase');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const url = document.getElementById('cfg-url').value.trim();
      const key = document.getElementById('cfg-key').value.trim();

      if (!url || !key) {
        toast('warning', 'Campos vazios', 'Informe a Project URL e a chave anon do Supabase.');
        return;
      }

      window.localStorage.setItem('FEIRA_SUPABASE_URL', url);
      window.localStorage.setItem('FEIRA_SUPABASE_KEY', key);

      toast('info', 'Conectando...', 'Validando credenciais do Supabase...');
      closeModal();

      setTimeout(() => {
        window.location.reload();
      }, 800);
    });

    document.getElementById('btn-toggle-demo').addEventListener('click', () => {
      window.localStorage.removeItem('FEIRA_SUPABASE_URL');
      window.localStorage.removeItem('FEIRA_SUPABASE_KEY');
      toast('success', 'Modo Demonstração', 'Alternado para demonstração com dados de São Lourenço do Piauí.');
      closeModal();
      setTimeout(() => window.location.reload(), 600);
    });
  }

  // ============================================================
  // 11. PÁGINA: CATÁLOGO DE PRODUTOS (RF03, RF04, RF05, RF08)
  // ============================================================
  async function renderCatalog() {
    state.catalogFilters.apenasFavoritos = false;
    const app = document.getElementById('app');
    app.innerHTML = `
      <!-- Hero -->
      <section class="hero">
        <div class="hero-content">
          <div class="hero-eyebrow">🌾 CETI Malaquias Ribeiro Damasceno · São Lourenço do Piauí</div>
          <h1>Produtos frescos direto<br><em>da roça para a sua mesa</em></h1>
          <p class="hero-sub">Conectando agricultores familiares e consumidores de São Lourenço do Piauí e região. Alimentos saudáveis, artesanais e sem intermediários.</p>
          
          <div class="hero-search">
            <input class="hero-search-input" id="hero-search" type="search"
              placeholder="Buscar alface, mel, queijo coalho, cesto..." autocomplete="off"
              value="${esc(state.catalogFilters.busca)}" aria-label="Buscar produtos">
            <button class="hero-search-btn" id="hero-search-btn" aria-label="Realizar busca">🔍 Buscar</button>
          </div>

          <div class="hero-stats" id="hero-stats">
            <div>
              <div class="hero-stat-num" id="stat-produtos">—</div>
              <div class="hero-stat-label">Produtos disponíveis</div>
            </div>
            <div>
              <div class="hero-stat-num" id="stat-produtores">—</div>
              <div class="hero-stat-label">Produtores locais</div>
            </div>
            <div>
              <div class="hero-stat-num">100%</div>
              <div class="hero-stat-label">Venda Direta (0% taxas)</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Catálogo Principal -->
      <section class="catalog-section" id="catalog-section">
        <div class="catalog-header">
          <!-- Filtro por Categorias -->
          <div class="category-pills" id="cat-pills" role="tablist" aria-label="Filtrar por categoria">
            <button class="pill ${state.catalogFilters.categoria_id === null ? 'active' : ''}" data-id="">
              🌾 Todas as categorias
            </button>
          </div>

          <!-- Barra de controles adicionais -->
          <div class="catalog-controls">
            <div class="results-count" id="results-count" aria-live="polite">Carregando produtos...</div>
            <div style="display:flex;align-items:center;gap:12px">
              <button class="btn btn-ghost btn-sm" id="btn-show-favs">
                ❤️ Ver Favoritos (<span class="badge-fav">0</span>)
              </button>
              <select class="catalog-sort" id="catalog-sort" aria-label="Ordenar produtos">
                <option value="recentes"   ${state.catalogFilters.ordem === 'recentes'   ? 'selected' : ''}>Mais recentes</option>
                <option value="preco_asc"  ${state.catalogFilters.ordem === 'preco_asc'  ? 'selected' : ''}>Menor preço</option>
                <option value="preco_desc" ${state.catalogFilters.ordem === 'preco_desc' ? 'selected' : ''}>Maior preço</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Grid de Produtos -->
        <div class="products-grid" id="products-grid">
          ${skeletonCards(4)}
        </div>
      </section>

      ${renderFooter()}
    `;

    try {
      const [categorias, produtos, produtores] = await Promise.all([
        getCategorias(),
        getProdutos(state.catalogFilters),
        getProdutores()
      ]);

      document.getElementById('stat-produtos').textContent = produtos.length;
      document.getElementById('stat-produtores').textContent = produtores.length;

      // Renderizar pills de categorias
      const pillsContainer = document.getElementById('cat-pills');
      categorias.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = `pill ${state.catalogFilters.categoria_id === cat.id ? 'active' : ''}`;
        btn.dataset.id = cat.id;
        btn.innerHTML = `${cat.icone} ${esc(cat.nome)}`;
        pillsContainer.appendChild(btn);
      });

      pillsContainer.addEventListener('click', (e) => {
        const pill = e.target.closest('.pill');
        if (!pill) return;
        state.catalogFilters.categoria_id = pill.dataset.id ? Number(pill.dataset.id) : null;
        reloadProducts();
      });

      // Ordenação
      document.getElementById('catalog-sort').addEventListener('change', (e) => {
        state.catalogFilters.ordem = e.target.value;
        reloadProducts();
      });

      // Ver favoritos
      document.getElementById('btn-show-favs').addEventListener('click', () => {
        navigate('favorites');
      });

      // Busca
      const searchInput = document.getElementById('hero-search');
      const searchBtn = document.getElementById('hero-search-btn');
      function doSearch() {
        state.catalogFilters.busca = searchInput.value.trim();
        reloadProducts();
      }
      searchBtn.addEventListener('click', doSearch);
      searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });

      renderProductCards(produtos);
      Favorites.updateBadges();

    } catch (err) {
      console.error('Erro catálogo:', err);
      showError('Erro ao carregar catálogo', err.message);
    }
  }

  // ============================================================
  // 12. PÁGINA: FAVORITOS (RF08)
  // ============================================================
  async function renderFavorites() {
    state.catalogFilters.apenasFavoritos = true;
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="page-container page-anim" style="padding-top:24px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:12px">
          <div>
            <h1 style="font-family:var(--font-heading);font-size:2rem;color:var(--primary-dark)">❤️ Meus Produtos Favoritos</h1>
            <p style="color:var(--text-muted)">Produtos que você salvou para contatar os agricultores de São Lourenço do Piauí.</p>
          </div>
          <a href="#catalog" class="btn btn-outline">⬅️ Voltar ao Catálogo Completo</a>
        </div>

        <div class="products-grid" id="products-grid">
          ${skeletonCards(2)}
        </div>
      </div>
      ${renderFooter()}
    `;

    try {
      const produtos = await getProdutos({ apenasFavoritos: true, showAll: true });
      renderProductCards(produtos);
      Favorites.updateBadges();
    } catch (err) {
      showError('Erro ao carregar favoritos', err.message);
    }
  }

  async function reloadProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    grid.innerHTML = skeletonCards(4);

    document.querySelectorAll('#cat-pills .pill').forEach(p => {
      const pid = p.dataset.id ? Number(p.dataset.id) : null;
      p.classList.toggle('active', pid === state.catalogFilters.categoria_id);
    });

    try {
      let sorted = await getProdutos(state.catalogFilters);
      if (state.catalogFilters.ordem === 'preco_asc')  sorted = [...sorted].sort((a, b) => a.preco - b.preco);
      if (state.catalogFilters.ordem === 'preco_desc') sorted = [...sorted].sort((a, b) => b.preco - a.preco);
      renderProductCards(sorted);
      Favorites.updateBadges();
    } catch (err) {
      showError('Erro ao filtrar produtos', err.message);
    }
  }

  let currentRenderedProducts = [];

  function bindCardAddEvent(btn) {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const pid = btn.dataset.id;
      const prod = currentRenderedProducts.find(p => String(p.id) === String(pid));
      if (prod) {
        Cart.addItem(prod, 1);
      }
    });
  }

  function bindCardQtyEvents(control) {
    const pid = control.dataset.id;
    control.querySelector('.btn-card-qty-plus')?.addEventListener('click', (e) => {
      e.preventDefault();
      Cart.updateQty(pid, 1);
    });
    control.querySelector('.btn-card-qty-minus')?.addEventListener('click', (e) => {
      e.preventDefault();
      Cart.updateQty(pid, -1);
    });
  }

  function renderProductCards(produtos) {
    const grid = document.getElementById('products-grid');
    const count = document.getElementById('results-count');
    if (!grid) return;

    if (!produtos || produtos.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="empty-state-icon">🌱</div>
          <h3>Nenhum produto encontrado</h3>
          <p>Tente ajustar os filtros ou pesquisar por outro produto.</p>
          ${state.catalogFilters.apenasFavoritos ? '<a href="#catalog" class="btn btn-primary" style="margin-top:12px">Explorar Catálogo</a>' : ''}
        </div>`;
      if (count) count.innerHTML = '<strong>0</strong> produtos encontrados';
      return;
    }

    currentRenderedProducts = produtos;
    const n = produtos.length;
    if (count) count.innerHTML = `<strong>${n}</strong> produto${n !== 1 ? 's' : ''} encontrado${n !== 1 ? 's' : ''}`;
    grid.innerHTML = produtos.map(p => productCard(p)).join('');

    // Eventos dos cards
    grid.querySelectorAll('.btn-add-cart').forEach(btn => bindCardAddEvent(btn));
    grid.querySelectorAll('.card-qty-control').forEach(ctrl => bindCardQtyEvents(ctrl));

    // Eventos de clique nos links de perfil de produtor
    grid.querySelectorAll('.producer-link').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        navigate(`producer/${a.dataset.id}`);
      });
    });

    // Eventos de clique no botão de favoritar
    grid.querySelectorAll('.fav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = btn.dataset.id;
        const isFav = Favorites.toggle(id);
        btn.classList.toggle('active', isFav);
        btn.innerHTML = isFav ? '❤️' : '🤍';
        toast('info', isFav ? 'Favoritado!' : 'Removido dos favoritos', isFav ? 'Produto salvo na sua lista.' : 'Produto removido da sua lista.');
      });
    });
  }

  function productCard(p) {
    const preco = parseFloat(p.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const catName = p.categorias?.nome || 'Outros';
    const catIcon = p.categorias?.icone || '🌾';
    const whatsapp = getWhatsAppUrl(p.produtores?.whatsapp, p.nome);
    const isFav = Favorites.has(p.id);
    const inCart = Cart.getItem(p.id);

    const imgHtml = p.foto_url
      ? `<img src="${esc(p.foto_url)}" alt="${esc(p.nome)}" loading="lazy">`
      : `<div class="product-img-placeholder">${catIcon}</div>`;

    return `
      <article class="product-card" data-product-id="${esc(p.id)}">
        <div class="product-img-wrap" style="position:relative">
          ${imgHtml}
          <button class="fav-btn ${isFav ? 'active' : ''}" data-id="${esc(p.id)}" title="${isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">
            ${isFav ? '❤️' : '🤍'}
          </button>
          <span class="product-category-badge">${catIcon} ${esc(catName)}</span>
          ${!p.disponivel ? '<span class="product-availability-badge badge-unavailable">Indisponível</span>' : ''}
        </div>
        <div class="product-body">
          <h3 class="product-name">${esc(p.nome)}</h3>
          ${p.descricao ? `<p class="product-desc">${esc(p.descricao)}</p>` : ''}
          <div class="product-price-row">
            <span class="product-price-value">${preco}</span>
            <span class="product-price-unit">/ ${esc(p.unidade || 'unidade')}</span>
          </div>
          <div class="product-producer-row">
            <span>👨‍🌾</span>
            <a class="producer-link" data-id="${esc(p.produtor_id)}" href="#producer/${esc(p.produtor_id)}">
              ${esc(p.produtores?.nome || 'Produtor Rural')}
            </a>
            ${p.produtores?.municipio ? `<span>· ${esc(p.produtores.municipio)}</span>` : ''}
          </div>
        </div>
        <div class="product-footer">
          ${!p.disponivel
            ? `<button class="btn btn-block" disabled style="opacity:0.6;margin-top:4px">Esgotado no momento</button>`
            : (inCart
              ? `<div class="card-qty-control" data-id="${esc(p.id)}">
                  <button class="btn-card-qty-minus" data-id="${esc(p.id)}" aria-label="Diminuir">-</button>
                  <span class="card-qty-num">🛒 ${inCart.quantidade} na cesta</span>
                  <button class="btn-card-qty-plus" data-id="${esc(p.id)}" aria-label="Aumentar">+</button>
                </div>`
              : `<button class="btn-add-cart" data-id="${esc(p.id)}">🛒 Adicionar à Cesta</button>`
            )
          }

          ${whatsapp !== '#'
            ? `<a href="${whatsapp}" target="_blank" rel="noopener noreferrer" style="display:inline-block;margin-top:8px;font-size:0.8rem;color:var(--primary);text-decoration:none;font-weight:600">📱 Tirar dúvida com Produtor</a>`
            : `<span style="display:inline-block;margin-top:8px;font-size:0.75rem;color:var(--text-muted)">📱 WhatsApp não informado</span>`
          }
        </div>
      </article>
    `;
  }

  // ============================================================
  // 13. PÁGINA: LISTA DE PRODUTORES
  // ============================================================
  async function renderProducers() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="page-container page-anim">
        <div class="section-title-wrap">
          <h1 class="section-title">👨‍🌾 Produtores da Agricultura Familiar</h1>
          <p class="section-sub">Conheça as famílias produtoras de São Lourenço do Piauí e apoie a economia local.</p>
        </div>
        <div class="producers-grid" id="producers-grid">
          ${skeletonCards(3)}
        </div>
      </div>
      ${renderFooter()}
    `;

    try {
      const produtores = await getProdutores();
      const grid = document.getElementById('producers-grid');

      if (!produtores.length) {
        grid.innerHTML = `
          <div class="empty-state" style="grid-column:1/-1">
            <div class="empty-state-icon">👨‍🌾</div>
            <h3>Nenhum produtor ativo no momento</h3>
            <p>Seja o primeiro a se cadastrar e vender para a comunidade!</p>
            <a href="#register" class="btn btn-primary" style="margin-top:16px">Cadastre-se como Produtor</a>
          </div>`;
        return;
      }

      grid.innerHTML = produtores.map(p => producerCard(p)).join('');
    } catch (err) {
      showError('Erro ao carregar produtores', err.message);
    }
  }

  function producerCard(p) {
    const initials = (p.nome || 'P').split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const whatsUrl = getWhatsAppUrl(p.whatsapp, 'seus produtos');

    return `
      <article class="producer-card">
        <div class="producer-card-header">
          <div class="producer-avatar">${initials}</div>
          <div>
            <h3 class="producer-name">${esc(p.nome)}</h3>
            <span class="producer-location">📍 ${esc(p.municipio || 'São Lourenço do Piauí - PI')}</span>
          </div>
        </div>
        ${p.descricao ? `<p class="producer-desc">${esc(p.descricao)}</p>` : ''}
        <div class="producer-card-actions">
          <a href="#producer/${esc(p.id)}" class="btn btn-outline btn-sm">Ver produtos</a>
          ${p.whatsapp && whatsUrl !== '#'
            ? `<a href="${whatsUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">📱 WhatsApp</a>`
            : ''
          }
        </div>
      </article>
    `;
  }

  // ============================================================
  // 14. PÁGINA: PERFIL DO PRODUTOR (RF06)
  // ============================================================
  async function renderProducerProfile(id) {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="page-container page-anim">
        <div class="spinner spinner-dark" style="margin:80px auto"></div>
      </div>`;

    try {
      const [produtor, produtos] = await Promise.all([
        getProdutorById(id),
        getProdutos({ produtor_id: id, showAll: false })
      ]);

      if (!produtor) {
        app.innerHTML = `
          <div class="empty-state" style="padding:100px 20px">
            <div class="empty-state-icon">🔍</div>
            <h3>Produtor não encontrado</h3>
            <p>O produtor pode ter sido removido ou o link está incorreto.</p>
            <a href="#producers" class="btn btn-primary" style="margin-top:16px">Ver todos os produtores</a>
          </div>`;
        return;
      }

      const initials = (produtor.nome || 'P').split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2);
      const whatsUrl = getWhatsAppUrl(produtor.whatsapp, 'seus produtos');

      app.innerHTML = `
        <div class="page-container page-anim">
          <div class="producer-profile-header">
            <div class="producer-profile-avatar">${initials}</div>
            <div class="producer-profile-info">
              <h1>${esc(produtor.nome)}</h1>
              <p class="producer-profile-meta">
                <span>📍 ${esc(produtor.municipio || 'São Lourenço do Piauí - PI')}</span>
                ${produtor.whatsapp ? `<span>· 📱 ${esc(produtor.whatsapp)}</span>` : ''}
              </p>
              ${produtor.descricao ? `<p class="producer-profile-bio">${esc(produtor.descricao)}</p>` : ''}
              <div style="margin-top:16px;display:flex;gap:12px;flex-wrap:wrap">
                ${produtor.whatsapp && whatsUrl !== '#'
                  ? `<a href="${whatsUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary"><span>📱</span> Conversar no WhatsApp</a>`
                  : ''
                }
                <a href="#catalog" class="btn btn-outline">⬅️ Voltar ao Catálogo</a>
              </div>
            </div>
          </div>

          <div style="margin-top:40px">
            <h2 style="font-family:var(--font-heading);font-size:1.5rem;margin-bottom:20px;color:var(--primary-dark)">
              Produtos oferecidos por ${esc(produtor.nome)} (${produtos.length})
            </h2>
            <div class="products-grid" id="products-grid"></div>
          </div>
        </div>
        ${renderFooter()}
      `;

      renderProductCards(produtos);
      Favorites.updateBadges();

    } catch (err) {
      showError('Erro ao carregar perfil', err.message);
    }
  }

  // ============================================================
  // 15. PÁGINAS DE AUTENTICAÇÃO (RF01 - T01, T02, T03)
  // ============================================================
  function renderLogin() {
    renderAuthPage('login');
  }

  function renderRegister() {
    renderAuthPage('register');
  }

  function renderAuthPage(tab) {
    if (state.user) {
      navigate('dashboard');
      return;
    }

    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="auth-page page-anim">
        <div class="auth-card">
          <div class="auth-logo">
            <span style="font-size:2.2rem">🌾</span>
            <div style="font-family:var(--font-heading);font-weight:700;font-size:1.4rem;color:var(--primary-dark)">Marketplace Rural</div>
            <p style="font-size:0.85rem;color:var(--text-muted)">São Lourenço do Piauí</p>
          </div>

          <div class="auth-tabs" role="tablist">
            <button class="auth-tab ${tab === 'login' ? 'active' : ''}" id="tab-login" role="tab">Entrar</button>
            <button class="auth-tab ${tab === 'register' ? 'active' : ''}" id="tab-register" role="tab">Cadastrar-se</button>
          </div>

          <div id="auth-form-wrap">
            ${tab === 'login' ? renderLoginForm() : renderRegisterForm()}
          </div>
        </div>
      </div>
    `;

    document.getElementById('tab-login').addEventListener('click', () => {
      document.getElementById('tab-login').classList.add('active');
      document.getElementById('tab-register').classList.remove('active');
      document.getElementById('auth-form-wrap').innerHTML = renderLoginForm();
      bindLoginForm();
    });

    document.getElementById('tab-register').addEventListener('click', () => {
      document.getElementById('tab-register').classList.add('active');
      document.getElementById('tab-login').classList.remove('active');
      document.getElementById('auth-form-wrap').innerHTML = renderRegisterForm();
      bindRegisterForm();
    });

    if (tab === 'login') bindLoginForm();
    else bindRegisterForm();
  }

  function renderLoginForm() {
    return `
      <form id="form-login" novalidate>
        <div class="form-group">
          <label class="form-label" for="login-email">E-mail</label>
          <input class="form-control" id="login-email" type="email" placeholder="seu@email.com" required autocomplete="email">
        </div>
        <div class="form-group">
          <label class="form-label" for="login-senha">Senha</label>
          <input class="form-control" id="login-senha" type="password" placeholder="Sua senha secreta" required autocomplete="current-password">
        </div>
        <button type="submit" class="btn btn-primary btn-block" id="btn-submit-login">Entrar na plataforma</button>

        ${state.isDemo ? `
          <div style="margin-top:16px;padding:12px;background:#FEF3C7;border-radius:8px;font-size:0.8rem;color:#92400E;line-height:1.4">
            <strong>🌱 Contas de teste rápidas (Modo Demonstração):</strong><br>
            • Produtor: <code>maria.horta@roca.local</code> (qualquer senha)<br>
            • Admin: <code>admin@ceti.pi.gov.br</code> (qualquer senha)
          </div>
        ` : ''}
      </form>
    `;
  }

  function renderRegisterForm() {
    return `
      <form id="form-register" novalidate>
        <div class="form-group">
          <label class="form-label" for="reg-nome">Nome completo ou Nome da Família <span class="required">*</span></label>
          <input class="form-control" id="reg-nome" type="text" placeholder="Ex: Dona Maria ou Família Silva" required autocomplete="name">
        </div>
        <div class="form-group">
          <label class="form-label" for="reg-whatsapp">WhatsApp (com DDD) <span class="required">*</span></label>
          <input class="form-control" id="reg-whatsapp" type="tel" placeholder="Ex: 89999112233" required autocomplete="tel">
          <span style="font-size:0.75rem;color:var(--text-muted)">Os consumidores entrarão em contato diretamente por este número.</span>
        </div>
        <div class="form-group">
          <label class="form-label" for="reg-municipio">Município / Comunidade Rural</label>
          <input class="form-control" id="reg-municipio" type="text" value="São Lourenço do Piauí - PI">
        </div>
        <div class="form-group">
          <label class="form-label" for="reg-desc">Apresentação / O que você produz</label>
          <textarea class="form-control" id="reg-desc" rows="2" placeholder="Conte um pouco sobre sua produção agrícola ou artesanato..."></textarea>
        </div>
        <div class="form-group">
          <label class="form-label" for="reg-email">E-mail para login <span class="required">*</span></label>
          <input class="form-control" id="reg-email" type="email" placeholder="seu@email.com" required autocomplete="email">
        </div>
        <div class="form-group">
          <label class="form-label" for="reg-senha">Senha <span class="required">*</span></label>
          <input class="form-control" id="reg-senha" type="password" placeholder="Mínimo 6 caracteres" minlength="6" required autocomplete="new-password">
        </div>
        <button type="submit" class="btn btn-primary btn-block" id="btn-submit-register">Criar minha conta de Produtor</button>
      </form>
    `;
  }

  function bindLoginForm() {
    const form = document.getElementById('form-login');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const senha = document.getElementById('login-senha').value;
      const btn = document.getElementById('btn-submit-login');

      if (!email || !senha) {
        toast('error', 'Campos vazios', 'Informe seu e-mail e senha.');
        return;
      }

      setButtonLoading(btn, true, 'Entrando...');
      try {
        const user = await doLogin(email, senha);
        toast('success', 'Bem-vindo!', 'Login realizado com sucesso.');
        await onLogin(user, true);
      } catch (err) {
        toast('error', 'Erro no login', err.message || 'Verifique seus dados.');
        setButtonLoading(btn, false, 'Entrar na plataforma');
      }
    });
  }

  function bindRegisterForm() {
    const form = document.getElementById('form-register');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nome = document.getElementById('reg-nome').value.trim();
      const whatsapp = document.getElementById('reg-whatsapp').value.trim();
      const municipio = document.getElementById('reg-municipio').value.trim();
      const descricao = document.getElementById('reg-desc').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const senha = document.getElementById('reg-senha').value;
      const btn = document.getElementById('btn-submit-register');

      if (!nome || !whatsapp || !email || !senha) {
        toast('error', 'Campos obrigatórios', 'Preencha nome, WhatsApp, e-mail e senha.');
        return;
      }
      if (senha.length < 6) {
        toast('error', 'Senha curta', 'A senha deve ter pelo menos 6 caracteres.');
        return;
      }

      setButtonLoading(btn, true, 'Cadastrando...');
      try {
        const user = await doRegister({ nome, whatsapp, municipio, descricao, email, senha });
        toast('success', 'Cadastro realizado!', 'Sua conta de produtor rural foi criada com sucesso!');
        await onLogin(user, true);
      } catch (err) {
        toast('error', 'Erro no cadastro', err.message || 'Não foi possível concluir o cadastro.');
        setButtonLoading(btn, false, 'Criar minha conta de Produtor');
      }
    });
  }

  // ============================================================
  // 16. PAINEL DO PRODUTOR (RF01, RF02 - T04, T05)
  // ============================================================
  async function renderDashboard() {
    if (!state.user) {
      navigate('login');
      return;
    }

    const app = document.getElementById('app');
    const p = state.produtor || { nome: 'Produtor' };

    app.innerHTML = `
      <div class="dashboard-page page-anim">
        <div class="dashboard-container">
          <div class="dashboard-header">
            <div class="dashboard-welcome">
              <h1>Olá, ${esc(p.nome)} 👋</h1>
              <p>Gerencie seus produtos ofertados para a comunidade de São Lourenço do Piauí.</p>
            </div>
            <div class="dashboard-actions">
              <button class="btn btn-primary" id="btn-novo-produto">➕ Cadastrar Novo Produto</button>
              <a href="#profile-edit" class="btn btn-outline">✏️ Editar Meu Perfil</a>
            </div>
          </div>

          <div class="dashboard-stats" id="dash-stats">
            <div class="dash-stat-card">
              <span class="dash-stat-icon">📦</span>
              <div>
                <div class="dash-stat-val" id="dash-total">—</div>
                <div class="dash-stat-lbl">Total de produtos</div>
              </div>
            </div>
            <div class="dash-stat-card">
              <span class="dash-stat-icon">✅</span>
              <div>
                <div class="dash-stat-val" id="dash-ativos">—</div>
                <div class="dash-stat-lbl">Disponíveis agora</div>
              </div>
            </div>
            <div class="dash-stat-card">
              <span class="dash-stat-icon">📱</span>
              <div>
                <div class="dash-stat-val">${esc(p.whatsapp || 'Não inf.')}</div>
                <div class="dash-stat-lbl">WhatsApp para vendas</div>
              </div>
            </div>
          </div>

          <div class="dashboard-card">
            <div class="dashboard-card-header">
              <h2>Meus Produtos no Catálogo</h2>
            </div>
            <div id="dash-products-table-wrap">
              <div class="spinner spinner-dark" style="margin:40px auto"></div>
            </div>
          </div>
        </div>
      </div>
      ${renderFooter()}
    `;

    document.getElementById('btn-novo-produto').addEventListener('click', () => openProductModal(null));

    try {
      const produtos = await getMeusProdutos();
      document.getElementById('dash-total').textContent = produtos.length;
      document.getElementById('dash-ativos').textContent = produtos.filter(x => x.disponivel).length;

      const tableWrap = document.getElementById('dash-products-table-wrap');

      if (!produtos.length) {
        tableWrap.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">🧺</div>
            <h3>Você ainda não cadastrou nenhum produto</h3>
            <p>Comece divulgando suas frutas, hortaliças, laticínios ou artesanatos para os consumidores.</p>
            <button class="btn btn-primary" style="margin-top:16px" id="btn-empty-novo">Cadastrar Meu Primeiro Produto</button>
          </div>`;
        document.getElementById('btn-empty-novo').addEventListener('click', () => openProductModal(null));
        return;
      }

      tableWrap.innerHTML = `
        <div style="overflow-x:auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Categoria</th>
                <th>Preço</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody id="dash-tbody"></tbody>
          </table>
        </div>
      `;

      const tbody = document.getElementById('dash-tbody');
      produtos.forEach(prod => {
        const tr = document.createElement('tr');
        const precoFmt = parseFloat(prod.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const catName = prod.categorias?.nome || 'Outros';
        const catIcon = prod.categorias?.icone || '🌾';

        tr.innerHTML = `
          <td>
            <div style="display:flex;align-items:center;gap:12px">
              ${prod.foto_url 
                ? `<img src="${esc(prod.foto_url)}" alt="${esc(prod.nome)}" style="width:44px;height:44px;border-radius:8px;object-fit:cover">`
                : `<div style="width:44px;height:44px;border-radius:8px;background:var(--primary-xlight);display:flex;align-items:center;justify-content:center;font-size:1.2rem">${catIcon}</div>`
              }
              <div>
                <strong>${esc(prod.nome)}</strong>
                ${prod.descricao ? `<div style="font-size:0.75rem;color:var(--text-muted);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(prod.descricao)}</div>` : ''}
              </div>
            </div>
          </td>
          <td>${catIcon} ${esc(catName)}</td>
          <td><strong>${precoFmt}</strong> <span style="font-size:0.8rem;color:var(--text-muted)">/ ${esc(prod.unidade || 'un')}</span></td>
          <td>
            <span class="badge ${prod.disponivel ? 'badge-success' : 'badge-danger'}">
              ${prod.disponivel ? 'Disponível' : 'Indisponível'}
            </span>
          </td>
          <td>
            <div style="display:flex;gap:6px">
              <button class="btn btn-ghost btn-sm btn-edit" title="Editar produto">✏️</button>
              <button class="btn btn-ghost btn-sm btn-toggle-disp" title="${prod.disponivel ? 'Marcar como esgotado' : 'Marcar como disponível'}">
                ${prod.disponivel ? '⏸️' : '▶️'}
              </button>
              <button class="btn btn-ghost btn-sm btn-delete" style="color:var(--danger)" title="Excluir produto">🗑️</button>
            </div>
          </td>
        `;

        tr.querySelector('.btn-edit').addEventListener('click', () => openProductModal(prod));
        tr.querySelector('.btn-toggle-disp').addEventListener('click', async () => {
          try {
            await upsertProduto({ id: prod.id, disponivel: !prod.disponivel });
            toast('success', 'Atualizado', `Produto marcado como ${!prod.disponivel ? 'disponível' : 'indisponível'}.`);
            renderDashboard();
          } catch (e) {
            toast('error', 'Erro', e.message);
          }
        });
        tr.querySelector('.btn-delete').addEventListener('click', () => confirmDeleteProduto(prod.id, tr));

        tbody.appendChild(tr);
      });

    } catch (err) {
      showError('Erro ao carregar painel', err.message);
    }
  }

  // ============================================================
  // 17. MODAL DE CADASTRO/EDIÇÃO DE PRODUTO (T04, T05)
  // ============================================================
  async function openProductModal(produto = null) {
    const categorias = await getCategorias();

    openModal({
      title: produto ? '✏️ Editar Produto' : '➕ Novo Produto para Venda',
      content: `
        <form id="form-produto" novalidate style="display:flex;flex-direction:column;gap:14px">
          <div>
            <label class="form-label" for="prod-nome">Nome do Produto <span class="required">*</span></label>
            <input class="form-control" id="prod-nome" type="text" placeholder="Ex: Queijo Coalho da Roça ou Tomate Cereja" required value="${esc(produto?.nome || '')}">
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div>
              <label class="form-label" for="prod-preco">Preço (R$) <span class="required">*</span></label>
              <input class="form-control" id="prod-preco" type="number" step="0.01" min="0.01" placeholder="Ex: 5.50" required value="${produto?.preco || ''}">
              <span style="font-size:0.75rem;color:var(--text-muted)">Deve ser maior que zero (R$ 0,00)</span>
            </div>
            <div>
              <label class="form-label" for="prod-unidade">Unidade de Medida <span class="required">*</span></label>
              <select class="form-control" id="prod-unidade" required>
                <option value="kg"      ${produto?.unidade === 'kg'      ? 'selected' : ''}>kg (quilo)</option>
                <option value="maço"    ${produto?.unidade === 'maço'    ? 'selected' : ''}>maço</option>
                <option value="unidade" ${produto?.unidade === 'unidade' || !produto ? 'selected' : ''}>unidade</option>
                <option value="litro"   ${produto?.unidade === 'litro'   ? 'selected' : ''}>litro</option>
                <option value="garrafa" ${produto?.unidade === 'garrafa' ? 'selected' : ''}>garrafa</option>
                <option value="pote"    ${produto?.unidade === 'pote'    ? 'selected' : ''}>pote</option>
                <option value="dúzia"   ${produto?.unidade === 'dúzia'   ? 'selected' : ''}>dúzia</option>
              </select>
            </div>
          </div>

          <div>
            <label class="form-label" for="prod-categoria">Categoria <span class="required">*</span></label>
            <select class="form-control" id="prod-categoria" required>
              ${categorias.map(c => `
                <option value="${c.id}" ${produto?.categoria_id === c.id ? 'selected' : ''}>${c.icone} ${esc(c.nome)}</option>
              `).join('')}
            </select>
          </div>

          <div>
            <label class="form-label" for="prod-desc">Descrição / Detalhes</label>
            <textarea class="form-control" id="prod-desc" rows="2" placeholder="Fale sobre o cultivo, frescor, sabor ou tamanho...">${esc(produto?.descricao || '')}</textarea>
          </div>

          <div>
            <label class="form-label">Foto do Produto (Opcional)</label>
            <div id="foto-upload-area" class="file-drop-area" style="border:2px dashed var(--border);padding:16px;text-align:center;border-radius:10px;cursor:pointer;background:var(--surface-2)">
              ${produto?.foto_url
                ? `<img src="${esc(produto.foto_url)}" class="file-preview" id="foto-preview" style="max-height:120px;border-radius:8px;object-fit:cover">`
                : `<p style="font-size:0.85rem;color:var(--text-muted)">📷 Clique aqui para selecionar uma foto do produto (máx. 5MB)</p>`
              }
            </div>
            <input type="file" id="prod-foto-input" accept="image/*" class="hidden">
          </div>

          <div style="display:flex;align-items:center;gap:8px">
            <input type="checkbox" id="prod-disponivel" ${produto?.disponivel !== false ? 'checked' : ''} style="width:18px;height:18px">
            <label for="prod-disponivel" style="cursor:pointer;font-size:0.9rem">Produto disponível para venda imediata</label>
          </div>

          <button type="submit" class="btn btn-primary btn-block" id="btn-save-produto" style="margin-top:8px">
            ${produto ? '💾 Salvar Alterações' : '🚀 Publicar Produto no Catálogo'}
          </button>
        </form>
      `
    });

    const fotoArea = document.getElementById('foto-upload-area');
    const fotoInput = document.getElementById('prod-foto-input');
    fotoArea.addEventListener('click', () => fotoInput.click());
    fotoInput.addEventListener('change', previewFoto);

    const form = document.getElementById('form-produto');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nome = document.getElementById('prod-nome').value.trim();
      const preco = parseFloat(document.getElementById('prod-preco').value);
      const unidade = document.getElementById('prod-unidade').value;
      const categoria_id = parseInt(document.getElementById('prod-categoria').value, 10);
      const descricao = document.getElementById('prod-desc').value.trim();
      const disponivel = document.getElementById('prod-disponivel').checked;
      const btn = document.getElementById('btn-save-produto');

      if (!nome) {
        toast('error', 'Campo obrigatório', 'Informe o nome do produto.');
        return;
      }
      if (isNaN(preco) || preco <= 0) {
        toast('error', 'Preço inválido (T05)', 'O valor deve ser maior que zero (R$ 0,00).');
        return;
      }

      setButtonLoading(btn, true, 'Salvando...');

      try {
        let foto_url = produto?.foto_url || null;
        if (fotoInput.files[0]) {
          foto_url = await uploadFoto(fotoInput.files[0]);
        }

        await upsertProduto({
          id: produto?.id,
          nome,
          preco,
          unidade,
          categoria_id,
          descricao,
          disponivel,
          foto_url
        });

        toast('success', produto ? 'Produto atualizado' : 'Produto cadastrado', 'As alterações já estão no catálogo!');
        closeModal();
        renderDashboard();
      } catch (err) {
        toast('error', 'Erro ao salvar', err.message);
        setButtonLoading(btn, false, produto ? 'Salvar Alterações' : 'Publicar Produto');
      }
    });
  }

  async function confirmDeleteProduto(id, row) {
    if (!confirm('Deseja realmente remover este produto do catálogo?')) return;
    try {
      await deleteProduto(id);
      row.remove();
      toast('success', 'Produto excluído', 'O item foi retirado do catálogo.');
    } catch (err) {
      toast('error', 'Erro ao excluir', err.message);
    }
  }

  // ============================================================
  // 18. EDIÇÃO DO PERFIL DO PRODUTOR (RF06)
  // ============================================================
  async function renderProfileEdit() {
    if (!state.user) {
      navigate('login');
      return;
    }

    const app = document.getElementById('app');
    const p = state.produtor || {};

    app.innerHTML = `
      <div class="page-container page-anim" style="max-width:680px;padding-top:20px">
        <div class="dashboard-header" style="margin-bottom:24px">
          <div>
            <h1 style="font-family:var(--font-heading);font-size:1.8rem;color:var(--primary-dark)">✏️ Meu Perfil de Produtor</h1>
            <p style="color:var(--text-muted)">Mantenha seus contatos atualizados para que os clientes encontrem você.</p>
          </div>
          <a href="#dashboard" class="btn btn-outline btn-sm">⬅️ Voltar ao Painel</a>
        </div>

        <div class="dashboard-card" style="padding:24px">
          <form id="form-profile" novalidate style="display:flex;flex-direction:column;gap:14px">
            <div>
              <label class="form-label" for="pe-nome">Nome do Produtor / Família <span class="required">*</span></label>
              <input class="form-control" id="pe-nome" type="text" value="${esc(p.nome || '')}" required>
            </div>

            <div>
              <label class="form-label" for="pe-whatsapp">WhatsApp (com DDD) <span class="required">*</span></label>
              <input class="form-control" id="pe-whatsapp" type="tel" value="${esc(p.whatsapp || '')}" required>
              <span style="font-size:0.75rem;color:var(--text-muted)">Exemplo: 89999112233 (apenas números ou formatado).</span>
            </div>

            <div>
              <label class="form-label" for="pe-municipio">Município / Localidade</label>
              <input class="form-control" id="pe-municipio" type="text" value="${esc(p.municipio || 'São Lourenço do Piauí - PI')}">
            </div>

            <div>
              <label class="form-label" for="pe-descricao">Biografia / Apresentação da sua produção</label>
              <textarea class="form-control" id="pe-descricao" rows="4">${esc(p.descricao || '')}</textarea>
            </div>

            <button type="submit" class="btn btn-primary" id="btn-save-profile" style="margin-top:10px">
              💾 Salvar Alterações do Perfil
            </button>
          </form>
        </div>
      </div>
      ${renderFooter()}
    `;

    document.getElementById('form-profile').addEventListener('submit', async (e) => {
      e.preventDefault();
      const nome = document.getElementById('pe-nome').value.trim();
      const whatsapp = document.getElementById('pe-whatsapp').value.trim();
      const municipio = document.getElementById('pe-municipio').value.trim();
      const descricao = document.getElementById('pe-descricao').value.trim();
      const btn = document.getElementById('btn-save-profile');

      if (!nome || !whatsapp) {
        toast('error', 'Campos obrigatórios', 'Nome e WhatsApp são necessários.');
        return;
      }

      setButtonLoading(btn, true, 'Salvando...');
      try {
        await updateProdutor({ nome, whatsapp, municipio, descricao });
        toast('success', 'Perfil atualizado', 'Seus dados foram atualizados com sucesso!');
        setButtonLoading(btn, false, '💾 Salvar Alterações do Perfil');
      } catch (err) {
        toast('error', 'Erro ao salvar', err.message);
        setButtonLoading(btn, false, '💾 Salvar Alterações do Perfil');
      }
    });
  }

  // ============================================================
  // 19. PAINEL DE ADMINISTRAÇÃO (RF07, T09)
  // ============================================================
  async function renderAdmin() {
    if (!state.user || !state.produtor?.is_admin) {
      toast('error', 'Acesso Restrito', 'Esta área é exclusiva para o administrador do CETI.');
      navigate('');
      return;
    }

    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="page-container page-anim">
        <div class="dashboard-header" style="margin-bottom:24px">
          <div>
            <h1 style="font-family:var(--font-heading);font-size:1.8rem;color:var(--primary-dark)">🛡️ Painel de Moderação e Administração</h1>
            <p style="color:var(--text-muted)">CETI Malaquias Ribeiro Damasceno · Controle de Produtores e Produtos</p>
          </div>
          <a href="#dashboard" class="btn btn-outline btn-sm">⬅️ Meu Painel</a>
        </div>

        <div class="dashboard-card" style="margin-bottom:30px">
          <div class="dashboard-card-header">
            <h2>👨‍🌾 Gerenciamento de Produtores (Aprovação / Bloqueio - RF07)</h2>
          </div>
          <div style="overflow-x:auto" id="admin-produtores-wrap">
            <div class="spinner spinner-dark" style="margin:30px auto"></div>
          </div>
        </div>

        <div class="dashboard-card">
          <div class="dashboard-card-header">
            <h2>📦 Moderação de Produtos</h2>
          </div>
          <div style="overflow-x:auto" id="admin-produtos-wrap">
            <div class="spinner spinner-dark" style="margin:30px auto"></div>
          </div>
        </div>
      </div>
      ${renderFooter()}
    `;

    try {
      const [produtores, produtos] = await Promise.all([
        getAllProdutores(),
        getAllProdutos()
      ]);

      // Produtores
      const prodWrap = document.getElementById('admin-produtores-wrap');
      prodWrap.innerHTML = `
        <table class="data-table">
          <thead>
            <tr>
              <th>Produtor</th>
              <th>WhatsApp</th>
              <th>Local</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${produtores.map(p => `
              <tr>
                <td><strong>${esc(p.nome)}</strong><div style="font-size:0.75rem;color:var(--text-muted)">${esc(p.email || '')}</div></td>
                <td>📱 ${esc(p.whatsapp || '—')}</td>
                <td>${esc(p.municipio || '—')}</td>
                <td>
                  <span class="badge ${p.status === 'ativo' ? 'badge-success' : (p.status === 'bloqueado' ? 'badge-danger' : 'badge-warning')}">
                    ${esc(p.status)}
                  </span>
                </td>
                <td>
                  <div style="display:flex;gap:6px">
                    ${p.status !== 'ativo' ? `<button class="btn btn-ghost btn-sm btn-status" data-id="${p.id}" data-st="ativo" title="Ativar">✅ Ativar</button>` : ''}
                    ${p.status !== 'bloqueado' ? `<button class="btn btn-ghost btn-sm btn-status" style="color:var(--danger)" data-id="${p.id}" data-st="bloqueado" title="Bloquear (T09)">🚫 Bloquear</button>` : ''}
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

      prodWrap.querySelectorAll('.btn-status').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.id;
          const st = btn.dataset.st;
          try {
            await updateProdutorStatus(id, st);
            toast('success', 'Status atualizado', `Produtor alterado para "${st}".`);
            renderAdmin();
          } catch (e) {
            toast('error', 'Erro', e.message);
          }
        });
      });

      // Produtos
      const prodListWrap = document.getElementById('admin-produtos-wrap');
      prodListWrap.innerHTML = `
        <table class="data-table">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Produtor</th>
              <th>Preço</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            ${produtos.map(pr => `
              <tr>
                <td><strong>${esc(pr.nome)}</strong></td>
                <td>${esc(pr.produtores?.nome || '—')}</td>
                <td>R$ ${parseFloat(pr.preco).toFixed(2)}</td>
                <td>
                  <button class="btn btn-ghost btn-sm btn-del-prod-adm" data-id="${pr.id}" style="color:var(--danger)" title="Remover produto da plataforma">
                    🗑️ Remover
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

      prodListWrap.querySelectorAll('.btn-del-prod-adm').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('Excluir este produto administrativamente?')) return;
          try {
            await deleteProdutoAdmin(btn.dataset.id);
            toast('success', 'Removido', 'Produto removido pelo administrador.');
            renderAdmin();
          } catch (e) {
            toast('error', 'Erro', e.message);
          }
        });
      });

    } catch (err) {
      showError('Erro ao carregar administração', err.message);
    }
  }

  // ============================================================
  // 20. CARRINHO DE COMPRAS — GAVETA (DRAWER) E PEDIDO WHATSAPP
  // ============================================================
  function setupCartDrawer() {
    const overlay = document.getElementById('cart-drawer-overlay');
    const drawer = document.getElementById('cart-drawer');
    const closeBtn = document.getElementById('btn-close-cart');
    const openBtn = document.getElementById('btn-open-cart');
    const mobileBtn = document.getElementById('mobile-cart-btn');
    const fabBtn = document.getElementById('cart-floating-fab');

    if (openBtn) openBtn.addEventListener('click', openCartDrawer);
    if (mobileBtn) mobileBtn.addEventListener('click', () => { closeMobileMenu(); openCartDrawer(); });
    if (fabBtn) fabBtn.addEventListener('click', openCartDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeCartDrawer);

    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeCartDrawer();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer && drawer.classList.contains('open')) {
        closeCartDrawer();
      }
    });

    renderCartDrawer();
  }

  function openCartDrawer() {
    const overlay = document.getElementById('cart-drawer-overlay');
    const drawer = document.getElementById('cart-drawer');
    if (!overlay || !drawer) return;
    renderCartDrawer();
    overlay.classList.remove('hidden');
    requestAnimationFrame(() => {
      overlay.classList.add('open');
      drawer.classList.add('open');
    });
    document.body.style.overflow = 'hidden';
  }

  function closeCartDrawer() {
    const overlay = document.getElementById('cart-drawer-overlay');
    const drawer = document.getElementById('cart-drawer');
    if (!overlay || !drawer) return;
    overlay.classList.remove('open');
    drawer.classList.remove('open');
    setTimeout(() => {
      overlay.classList.add('hidden');
      document.body.style.overflow = '';
    }, 300);
  }

  function renderCartDrawer() {
    const body = document.getElementById('cart-drawer-body');
    const footer = document.getElementById('cart-drawer-footer');
    if (!body || !footer) return;

    const items = Cart.getItems();

    if (items.length === 0) {
      body.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty-icon">🧺</div>
          <h3 style="font-size:1.15rem;font-weight:700;color:var(--primary-dark)">Sua cesta está vazia</h3>
          <p style="font-size:0.88rem;color:var(--text-muted);margin-top:6px">
            Explore o catálogo e adicione produtos frescos da agricultura familiar de São Lourenço do Piauí!
          </p>
          <button class="btn btn-primary btn-sm" style="margin-top:18px" id="btn-cart-shop">
            Explorar Catálogo
          </button>
        </div>
      `;
      footer.innerHTML = '';
      footer.style.display = 'none';

      document.getElementById('btn-cart-shop')?.addEventListener('click', () => {
        closeCartDrawer();
        navigate('catalog');
      });
      return;
    }

    footer.style.display = 'flex';
    const groups = Cart.getGroupByProducer();
    const totalGeral = Cart.getTotalPrice();
    const totalGeralFmt = totalGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    let groupsHtml = '';
    if (groups.length > 1) {
      groupsHtml += `
        <div style="padding:10px 14px;background:#EBF5FF;border:1px solid #BFDBFE;border-radius:8px;font-size:0.82rem;color:#1E40AF;line-height:1.4">
          ℹ️ <strong>Venda Direta:</strong> Você tem produtos de <strong>${groups.length} produtores diferentes</strong>. Envie a mensagem no WhatsApp de cada um para combinar a entrega!
        </div>
      `;
    }

    groups.forEach(group => {
      const totalProdFmt = group.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      const whatsUrl = getCartWhatsAppUrl(group, '');

      groupsHtml += `
        <div class="cart-producer-group">
          <div class="cart-producer-header">
            <div class="cart-producer-name">
              <span>👨‍🌾</span> ${esc(group.nome)}
            </div>
            <div class="cart-producer-subtotal">
              ${totalProdFmt}
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:8px">
            ${group.items.map(item => {
              const subtotal = item.preco * item.quantidade;
              const unitPriceFmt = item.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
              const subtotalFmt = subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

              return `
                <div class="cart-item-row" data-id="${esc(item.id)}">
                  ${item.foto_url
                    ? `<img src="${esc(item.foto_url)}" alt="${esc(item.nome)}" class="cart-item-img">`
                    : `<div class="cart-item-img">${item.categoria_icone || '🌾'}</div>`
                  }
                  <div class="cart-item-info">
                    <span class="cart-item-title">${esc(item.nome)}</span>
                    <span class="cart-item-price">${unitPriceFmt} / ${esc(item.unidade)}</span>
                    <span class="cart-item-subtotal">Subtotal: ${subtotalFmt}</span>
                  </div>
                  <div class="cart-item-actions">
                    <div class="cart-qty-box">
                      <button class="cart-qty-btn btn-cart-dec" data-id="${esc(item.id)}" title="Diminuir">-</button>
                      <span class="cart-qty-val">${item.quantidade}</span>
                      <button class="cart-qty-btn btn-cart-inc" data-id="${esc(item.id)}" title="Aumentar">+</button>
                    </div>
                    <button class="cart-remove-item btn-cart-del" data-id="${esc(item.id)}">Remover</button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          ${group.whatsapp
            ? `<a href="${whatsUrl}" target="_blank" rel="noopener noreferrer" class="btn-checkout-whatsapp btn-send-group-order" data-producer-id="${esc(group.produtor_id)}">
                <span>📱</span> Enviar Pedido via WhatsApp (${totalProdFmt})
              </a>`
            : `<button class="btn btn-block" disabled style="opacity:0.6;font-size:0.85rem;margin-top:6px">WhatsApp do produtor não informado</button>`
          }
        </div>
      `;
    });

    body.innerHTML = groupsHtml;

    // Ações do footer
    footer.innerHTML = `
      <div class="cart-total-row">
        <span>Total da Cesta:</span>
        <span style="color:var(--primary)">${totalGeralFmt}</span>
      </div>
      <div>
        <label for="cart-notes" style="font-size:0.8rem;font-weight:600;color:var(--text-muted);display:block;margin-bottom:4px">
          Observações / Ponto de Entrega (Opcional):
        </label>
        <textarea class="cart-notes-input" id="cart-notes" rows="2" placeholder="Ex: Entregar na praça central no sábado, troco para R$ 50..."></textarea>
      </div>
      <div class="cart-footer-actions">
        <button class="btn btn-outline btn-sm" id="btn-clear-cart" style="flex:1">Limpar Cesta</button>
        <button class="btn btn-primary btn-sm" id="btn-continue-shopping" style="flex:1">Continuar Comprando</button>
      </div>
    `;

    // Eventos dentro do Drawer
    body.querySelectorAll('.btn-cart-inc').forEach(btn => {
      btn.addEventListener('click', () => Cart.updateQty(btn.dataset.id, 1));
    });
    body.querySelectorAll('.btn-cart-dec').forEach(btn => {
      btn.addEventListener('click', () => Cart.updateQty(btn.dataset.id, -1));
    });
    body.querySelectorAll('.btn-cart-del').forEach(btn => {
      btn.addEventListener('click', () => Cart.removeItem(btn.dataset.id));
    });

    // Atualiza o link do WhatsApp ao digitar notas
    const notesEl = document.getElementById('cart-notes');
    body.querySelectorAll('.btn-send-group-order').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const pid = btn.dataset.producerId;
        const group = groups.find(g => String(g.produtor_id) === String(pid));
        if (group) {
          const notes = notesEl ? notesEl.value.trim() : '';
          btn.href = getCartWhatsAppUrl(group, notes);
        }
      });
    });

    document.getElementById('btn-clear-cart')?.addEventListener('click', () => {
      if (confirm('Deseja esvaziar todos os itens da sua cesta?')) {
        Cart.clear();
      }
    });

    document.getElementById('btn-continue-shopping')?.addEventListener('click', closeCartDrawer);
  }

  function getCartWhatsAppUrl(group, notes) {
    if (!group.whatsapp) return '#';
    const num = String(group.whatsapp).replace(/\D/g, '');
    if (!num) return '#';
    const full = num.startsWith('55') ? num : '55' + num;

    const totalFmt = group.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const itensList = group.items.map(i => {
      const sub = (i.preco * i.quantidade).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      return `• ${i.quantidade}x *${i.nome}* (${sub})`;
    }).join('\n');

    let msg = `Olá, *${group.nome}*! 👋\n` +
      `Vi seus produtos no *Marketplace Rural* (São Lourenço do Piauí) e montei o seguinte pedido:\n\n` +
      `📦 *ITENS DO PEDIDO:*\n${itensList}\n\n` +
      `💰 *Total: ${totalFmt}*\n`;

    if (notes) {
      msg += `📝 *Observação:* ${notes}\n`;
    }

    msg += `\nPodemos combinar a forma de entrega ou retirada? Obrigado!`;

    return `https://wa.me/${full}?text=${encodeURIComponent(msg)}`;
  }

  function updateCardsCartState() {
    document.querySelectorAll('.product-card').forEach(card => {
      const pid = card.dataset.productId;
      if (!pid) return;

      const inCart = Cart.getItem(pid);
      const footer = card.querySelector('.product-footer');
      if (!footer) return;

      const existingBtn = footer.querySelector('.btn-add-cart');
      const existingQty = footer.querySelector('.card-qty-control');

      if (inCart) {
        if (existingBtn) {
          const control = document.createElement('div');
          control.className = 'card-qty-control';
          control.dataset.id = pid;
          control.innerHTML = `
            <button class="btn-card-qty-minus" data-id="${esc(pid)}" aria-label="Diminuir">-</button>
            <span class="card-qty-num">🛒 ${inCart.quantidade} na cesta</span>
            <button class="btn-card-qty-plus" data-id="${esc(pid)}" aria-label="Aumentar">+</button>
          `;
          existingBtn.replaceWith(control);
          bindCardQtyEvents(control);
        } else if (existingQty) {
          const numEl = existingQty.querySelector('.card-qty-num');
          if (numEl) numEl.textContent = `🛒 ${inCart.quantidade} na cesta`;
        }
      } else {
        if (existingQty) {
          const newBtn = document.createElement('button');
          newBtn.className = 'btn-add-cart';
          newBtn.dataset.id = pid;
          newBtn.innerHTML = `🛒 Adicionar à Cesta`;
          existingQty.replaceWith(newBtn);
          bindCardAddEvent(newBtn);
        }
      }
    });
  }

  // ============================================================
  // 21. UTILITÁRIOS E MODAIS (RF05 WhatsApp, Toast, Preview)
  // ============================================================
  function setupModal() {
    const overlay = document.getElementById('modal-overlay');
    document.getElementById('modal-close').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  }

  function openModal({ title, content, footer }) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = content;
    document.getElementById('modal-footer').innerHTML = footer || '';
    document.getElementById('modal-overlay').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
    document.body.style.overflow = '';
  }

  function toast(type, title, msg) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const el = document.createElement('div');
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    el.className = `toast toast-${type}`;
    el.innerHTML = `
      <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
      <div class="toast-body">
        <div class="toast-title">${esc(title)}</div>
        <div class="toast-msg">${esc(msg)}</div>
      </div>
    `;

    container.appendChild(el);
    setTimeout(() => {
      el.classList.add('fade-out');
      setTimeout(() => el.remove(), 400);
    }, 4500);
  }

  function showError(title, msg) {
    toast('error', title, msg);
  }

  function setButtonLoading(btn, loading, label) {
    if (!btn) return;
    if (loading) {
      btn.disabled = true;
      btn.dataset.origLabel = btn.textContent;
      btn.innerHTML = `<span class="spinner" style="width:16px;height:16px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:6px"></span> Aguarde...`;
    } else {
      btn.disabled = false;
      btn.textContent = label || btn.dataset.origLabel || 'Enviar';
    }
  }

  function esc(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getWhatsAppUrl(whatsapp, produto) {
    if (!whatsapp) return '#';
    const num = String(whatsapp).replace(/\D/g, '');
    if (!num) return '#';
    const full = num.startsWith('55') ? num : '55' + num;
    const msg = encodeURIComponent(`Olá! Vi o produto *${produto}* na Feira Digital da Roça (São Lourenço do Piauí) e gostaria de combinar a compra. Está disponível?`);
    return `https://wa.me/${full}?text=${msg}`;
  }

  function skeletonCards(n) {
    const card = `
      <div style="background:white;border-radius:16px;border:1px solid #E8F5EF;overflow:hidden;" aria-hidden="true">
        <div style="aspect-ratio:4/3;background:linear-gradient(90deg,#F0FDF4 25%,#DCFCE7 50%,#F0FDF4 75%);background-size:200% 100%;animation:shimmer 1.5s ease infinite"></div>
        <div style="padding:16px;display:flex;flex-direction:column;gap:10px">
          <div style="height:14px;background:#F0FDF4;border-radius:6px;width:70%;animation:pulse 1.5s ease infinite"></div>
          <div style="height:11px;background:#F0FDF4;border-radius:6px;width:50%;animation:pulse 1.5s ease infinite 0.1s"></div>
          <div style="height:20px;background:#F0FDF4;border-radius:6px;width:40%;animation:pulse 1.5s ease infinite 0.2s"></div>
        </div>
      </div>`;
    return Array(n).fill(card).join('');
  }

  function previewFoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast('error', 'Arquivo muito grande', 'A foto deve ter no máximo 5MB.');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const area = document.getElementById('foto-upload-area');
      area.innerHTML = `<img src="${ev.target.result}" class="file-preview" id="foto-preview" style="max-height:120px;border-radius:8px;object-fit:cover">`;
    };
    reader.readAsDataURL(file);
  }

  function renderFooter() {
    const year = new Date().getFullYear();
    return `
      <footer class="site-footer" style="background:#1B4332;color:white;padding:40px 24px;margin-top:60px">
        <div style="max-width:1200px;margin:0 auto;display:flex;flex-direction:column;align-items:center;text-align:center;gap:16px">
          <div style="font-size:1.6rem;font-weight:700;font-family:var(--font-heading)">🌾 Marketplace Rural · Agricultura Familiar</div>
          <p style="font-size:0.9rem;opacity:0.85;max-width:600px">
            Projeto Integrador — Trabalho de Campo Orientado (TCO)<br>
            Curso Técnico em Análise e Desenvolvimento de Sistemas<br>
            <strong>CETI Malaquias Ribeiro Damasceno</strong> · São Lourenço do Piauí — PI
          </p>
          <div class="footer-links" style="display:flex;gap:20px;flex-wrap:wrap;margin:10px 0">
            <a href="#catalog" class="footer-link" style="color:#A7F3C0;text-decoration:none">🛒 Catálogo</a>
            <a href="#producers" class="footer-link" style="color:#A7F3C0;text-decoration:none">👨‍🌾 Produtores</a>
            <a href="#favorites" class="footer-link" style="color:#A7F3C0;text-decoration:none">❤️ Favoritos</a>
            <a href="#register" class="footer-link" style="color:#A7F3C0;text-decoration:none">🌱 Cadastre sua Produção</a>
          </div>
          <p style="font-size:0.8rem;opacity:0.6;margin-top:10px">
            © ${year} · Grupo Ana Isabel · Orientador: Prof. Jean de Santana Souza
          </p>
        </div>
      </footer>
    `;
  }

  // ============================================================
  // 21. ESTILOS DINÂMICOS
  // ============================================================
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
    @keyframes pulse   { 0%,100%{opacity:.4} 50%{opacity:.8} }
  `;
  document.head.appendChild(styleEl);

  // Inicialização
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
