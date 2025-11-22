import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient.js';

export default function Debug() {
  const [result, setResult] = useState('Testando...');

  useEffect(() => {
    testDatabase();
  }, []);

  const testDatabase = async () => {
    try {
      let debugInfo = '# 🔍 DEBUG DO BANCO DE DADOS\n\n';

      // 1. Testar sessão
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      debugInfo += '## 1. SESSÃO:\n';
      debugInfo += `- Logado: ${session ? 'SIM' : 'NÃO'}\n`;
      debugInfo += `- Email: ${session?.user?.email || 'N/A'}\n`;
      debugInfo += `- Erro: ${sessionError?.message || 'Nenhum'}\n\n`;

      if (session) {
        // 2. Testar tabela USER
        debugInfo += '## 2. TABELA USER:\n';
        
        // Tentar buscar todos os registros
        const { data: allUsers, error: allError } = await supabase
          .from('user')
          .select('*');
        
        debugInfo += `- Total de registros: ${allUsers?.length || 0}\n`;
        debugInfo += `- Erro: ${allError?.message || 'Nenhum'}\n`;
        
        if (allUsers && allUsers.length > 0) {
          debugInfo += '- Primeiro registro:\n';
          debugInfo += '```json\n' + JSON.stringify(allUsers[0], null, 2) + '\n```\n';
        }

        // 3. Buscar usuário específico
        debugInfo += `\n## 3. BUSCA POR: ${session.user.email}\n`;
        
        const { data: userData, error: userError } = await supabase
          .from('user')
          .select('*')
          .eq('email_user', session.user.email)
          .single();
        
        debugInfo += `- Encontrado: ${userData ? 'SIM' : 'NÃO'}\n`;
        debugInfo += `- Erro: ${userError?.message || 'Nenhum'}\n`;
        
        if (userData) {
          debugInfo += '- Dados encontrados:\n';
          debugInfo += '```json\n' + JSON.stringify(userData, null, 2) + '\n```\n';
        }

        // 4. Testar outras tabelas
        debugInfo += '\n## 4. OUTRAS TABELAS:\n';
        
        // Testar freelancer
        const { data: freelancers, error: freeError } = await supabase
          .from('freelancer')
          .select('*')
          .limit(1);
        debugInfo += `- Freelancer: ${freelancers?.length || 0} registros\n`;
        
        // Testar company  
        const { data: companies, error: compError } = await supabase
          .from('company')
          .select('*')
          .limit(1);
        debugInfo += `- Company: ${companies?.length || 0} registros\n`;
      }

      setResult(debugInfo);

    } catch (error) {
      setResult(`❌ ERRO: ${error.message}\n\nStack: ${error.stack}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
      <h1>🛠️ Debug do Banco de Dados</h1>
      <button onClick={testDatabase} style={{ padding: '10px', margin: '10px 0' }}>
        🔄 Executar Testes Novamente
      </button>
      <div style={{ 
        background: '#f5f5f5', 
        padding: '15px', 
        borderRadius: '5px', 
        border: '1px solid #ddd',
        marginTop: '10px'
      }}>
        {result}
      </div>
    </div>
  );
}