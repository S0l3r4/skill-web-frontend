import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient.js';

export default function Debug() {
  const [result, setResult] = useState('Testando...');

  useEffect(() => {
    testDatabase();
  }, []);

  const testDatabase = async () => {
    try {
      let debugInfo = '# 🔍 DEBUG DETALHADO DO BANCO\n\n';

      // 1. Sessão
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      debugInfo += '## 1. SESSÃO:\n';
      debugInfo += `- Logado: ${session ? 'SIM' : 'NÃO'}\n`;
      debugInfo += `- Email: ${session?.user?.email || 'N/A'}\n\n`;

      if (session) {
        // 2. VER TODOS OS DADOS DA TABELA USER
        debugInfo += '## 2. TODOS OS DADOS DA TABELA USER:\n';
        
        const { data: allUsers, error: allError } = await supabase
          .from('user')
          .select('*');
        
        debugInfo += `- Total de registros: ${allUsers?.length || 0}\n`;
        
        if (allUsers && allUsers.length > 0) {
          debugInfo += '- TODOS os registros:\n';
          allUsers.forEach((user, index) => {
            debugInfo += `\n### Registro ${index + 1}:\n`;
            debugInfo += '```json\n' + JSON.stringify(user, null, 2) + '\n```\n';
          });
        } else {
          debugInfo += '- ❌ TABELA VAZIA\n';
        }

        // 3. TESTAR DIFERENTES FORMAS DE BUSCA
        debugInfo += '\n## 3. TESTES DE BUSCA:\n';
        
        const testEmail = session.user.email;
        
        // Teste 1: Busca com eq (exact match)
        const { data: user1, error: e1 } = await supabase
          .from('user')
          .select('*')
          .eq('email_user', testEmail);
        debugInfo += `- Busca 'eq(${testEmail})': ${user1?.length || 0} resultados\n`;
        debugInfo += `  Erro: ${e1?.message || 'Nenhum'}\n`;

        // Teste 2: Busca com ilike (case insensitive)
        const { data: user2, error: e2 } = await supabase
          .from('user')
          .select('*')
          .ilike('email_user', testEmail);
        debugInfo += `- Busca 'ilike(${testEmail})': ${user2?.length || 0} resultados\n`;
        debugInfo += `  Erro: ${e2?.message || 'Nenhum'}\n`;

        // Teste 3: Buscar por qualquer campo que contenha email
        const { data: user3, error: e3 } = await supabase
          .from('user')
          .select('*')
          .ilike('email', testEmail);
        debugInfo += `- Busca 'ilike(email)': ${user3?.length || 0} resultados\n`;

        // Teste 4: Buscar TODOS os campos de texto
        const { data: user4, error: e4 } = await supabase
          .from('user')
          .select('*')
          .textSearch('email_user', testEmail);
        debugInfo += `- Busca 'textSearch': ${user4?.length || 0} resultados\n`;

        // 4. VER ESTRUTURA EXATA DOS CAMPOS
        debugInfo += '\n## 4. ESTRUTURA DOS DADOS:\n';
        if (allUsers && allUsers.length > 0) {
          const firstUser = allUsers[0];
          debugInfo += '- Campos do primeiro registro:\n';
          Object.keys(firstUser).forEach(key => {
            debugInfo += `  - ${key}: ${typeof firstUser[key]} = "${firstUser[key]}"\n`;
          });
          
          // Verificar emails exatos
          debugInfo += '\n- Emails encontrados na tabela:\n';
          allUsers.forEach(user => {
            const emailField = user.email_user || user.email;
            debugInfo += `  - "${emailField}"\n`;
          });
        }
      }

      setResult(debugInfo);

    } catch (error) {
      setResult(`❌ ERRO: ${error.message}\n\nStack: ${error.stack}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
      <h1>🛠️ Debug Detalhado</h1>
      <button onClick={testDatabase} style={{ padding: '10px', margin: '10px 0' }}>
        🔄 Executar Testes Novamente
      </button>
      <div style={{ 
        background: '#f5f5f5', 
        padding: '15px', 
        borderRadius: '5px', 
        border: '1px solid #ddd',
        marginTop: '10px',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        {result}
      </div>
    </div>
  );
}