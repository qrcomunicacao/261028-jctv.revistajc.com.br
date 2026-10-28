# CloudBridge

Gerenciador de arquivos para Microsoft Azure Blob Storage e Backblaze B2 construído em React 19, TypeScript e Tailwind CSS com Vite.

Interface inspirada na organização do Google Drive e nos painéis de transferência do FileZilla.

## Recursos Implementados

- **Autenticação demonstrativa**: Tela de boas-vindas com botão de login Google e encerramento de sessão.
- **Conexão Microsoft Azure Blob Storage**:
  - Integração backend nativa via `@azure/storage-blob` com suporte a `AZURE_STORAGE_CONNECTION_STRING` ou `AZURE_STORAGE_SAS_TOKEN`.
  - Conectado à conta `storagetvjustica` com contêiner `drive` (Concedido) e contêineres de sistema (`$blobchangefeed`, `$logs`).
  - Navegação completa por todos os **5.687 itens indexados** (pastas `BE 0005`, `BE 2462` e subdiretórios).
  - Respeito a limites e paginação com barra de navegação idêntica ao Azure Storage Explorer (`<< < Página X de Y > >>`, seletor de 25, 50, 100 ou 200 itens por página).
  - Breadcrumb dinâmico com navegação multinível de diretórios e retorno ao início.
- **Explorador de arquivos e Transferência**:
  - Visão unificada ("Todos os arquivos") e visões dedicadas por nuvem (Microsoft Azure e Backblaze B2).
  - Modos de visualização em Lista ou Grade.
  - Filtros por categoria (Todos, Pastas, Vídeos, Imagens, PDFs).
  - Barra de navegação breadcrumb com suporte para exploração de subdiretórios.
  - Painel lateral de detalhes de arquivos com atalho para cópia entre nuvens.
- **Transferência entre nuvens**:
  - Painel duplo interativo com suporte para arrastar e soltar (drag and drop) de arquivos entre Azure e Backblaze.
  - Botões de transferência direcionais (`→` e `←`) com detecção de seleção.
  - Fila de transferências com status de conclusão.
- **Histórico de atividades**: Registro de todas as operações e cópias executadas na sessão.
- **Pesquisa instantânea**: Campo de busca global integrado no cabeçalho com redirecionamento automático para a lista filtrada.
- **Notificações toast**: Alertas visuais flutuantes para todas as ações.

## Execução

```bash
npm run dev
```

O servidor iniciará em `http://0.0.0.0:3000`.

Criado para QR Comunicação.
