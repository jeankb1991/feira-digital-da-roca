// ============================================================
// MARKETPLACE RURAL — AGRICULTURA FAMILIAR
// Configuração do Supabase (Database, Auth & Storage)
// CETI Malaquias Ribeiro Damasceno — São Lourenço do Piauí, PI
// ============================================================
//
// COMO CONFIGURAR:
// 1. Acesse https://supabase.com e crie seu projeto gratuito.
// 2. No menu lateral, acesse: Project Settings -> API
// 3. Copie a "Project URL" e cole em SUPABASE_URL abaixo.
// 4. Copie a chave "anon public" e cole em SUPABASE_KEY abaixo.
// 5. Salve este arquivo e envie para o GitHub!
//
// DICA: Você também pode colar as chaves diretamente pela tela da
// aplicação (botão "⚙️ Configurar Supabase") que elas serão salvas
// no seu navegador (localStorage).
// ============================================================

const SUPABASE_CONFIG = {
  // Substitua pelos valores do seu projeto Supabase:
  url: window.localStorage.getItem('FEIRA_SUPABASE_URL') || 'https://SEU_PROJETO.supabase.co',
  key: window.localStorage.getItem('FEIRA_SUPABASE_KEY') || 'SUA_ANON_KEY_AQUI',
  
  // Informações do Projeto Integrador
  nomeProjeto: 'Marketplace Rural: Agricultura Familiar',
  comunidade: 'São Lourenço do Piauí - PI',
  escola: 'CETI Malaquias Ribeiro Damasceno'
};

const SUPABASE_URL = SUPABASE_CONFIG.url;
const SUPABASE_KEY = SUPABASE_CONFIG.key;
