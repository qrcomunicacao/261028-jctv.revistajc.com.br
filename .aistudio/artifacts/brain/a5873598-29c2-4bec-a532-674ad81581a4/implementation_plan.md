# Sincronização em Tempo Real e Normalização de Arquivos CloudBridge & Backblaze B2

Plano para resolver a discrepância de sincronização com o Backblaze B2, unificar pastas com nomes duplicados ou espaçamentos múltiplos (como `BE  2462` e `BE 2462`), e adicionar verificação ao vivo de integridade dos arquivos diretamente na API S3 do Backblaze.

## Confirmações do Usuário e Decisões Críticas

> [!IMPORTANT]
> As seguintes definições foram confirmadas pelo usuário na etapa de alinhamento:

- **Confirmação de Disponibilidade**: Os arquivos transferidos (como a pasta `BE 0005` e seus vídeos `.mxf`) já estão gravados e confirmados no Backblaze B2. A exibição no console web do Backblaze exigia apenas o clique no botão "Sincronizar" (ou reload), pois o console oficial do Backblaze não faz polling em tempo real.
- **Normalização de Espaçamento**: O sistema irá consolidar e normalizar nomes com espaços múltiplos ou redundantes (ex: transformar `BE  2462` e `BE 2462` na forma limpa `BE 2462`), agrupando os arquivos sob o mesmo prefixo lógico e impedindo duplicidades visuais.
- **Verificação Ao Vivo de Integridade (Live S3 Check)**: Adicionar um botão e indicador de status de verificação direta no Backblaze B2, que consulta instantaneamente o bucket via S3 API, calcula o hash/tamanho e exibe o selo de confirmação de gravação imediata na nuvem.

---

## 1. Visão Geral e Conceito Central

- **O que faz**: Proporciona transparência total sobre o estado dos arquivos transferidos para o Backblaze B2, eliminando atrasos percebidos pelo usuário, garantindo a correspondência 1:1 entre a interface da Revista Justiça e Cidadania e os baldes reais da Backblaze (`JurisTVUpload` e `JurisTVUpload2`), e prevenindo pastas fantasmas ou nomes duplicados por diferenças de espaços.
- **Público-Alvo**: Equipe de comunicação e edição audiovisual da TV Justiça e Revista Justiça e Cidadania (gestão de matérias em MXF, MP4, PDFs e acervo).
- **Tempo de Sincronização do Backblaze**:
  - **Acesso via API S3 (CloudBridge)**: **Imediato (0 segundos)**. O Backblaze B2 possui consistência imediata (*read-after-write consistency*). Assim que a transferência é concluída pelo servidor, o objeto já existe no bucket.
  - **Console Web da Backblaze**: Requer atualização manual (clicar em **⟲ Sincronizar** no cabeçalho do bucket ou recarregar a aba).

---

## 2. Experiência do Usuário e Design Visual

- **Fluxo do Usuário**:
  1. O usuário transfere um arquivo ou pasta (ex: `BE 0005` ou `BE 2462`) da Azure para o Backblaze B2.
  2. Ao finalizar a transferência, a modal de progresso exibe o selo verde de gravação confirmada no bucket `JurisTVUpload` com o timestamp exato e um atalho com aviso amigável: *"Arquivos gravados com sucesso! No console web do Backblaze, clique em 'Sincronizar' para atualizar a visualização."*
  3. Na listagem do Backblaze B2, o usuário clica em **"Verificar no B2"** para fazer uma varredura direta via S3, exibindo quantidade de objetos, tamanho real e data exata de modificação.
  4. Nomes com espaços duplicados são automaticamente agrupados e normalizados na exibição, evitando a exibição de duas linhas com o mesmo nome visual.

- **Identidade Visual (Editora JC)**:
  - Cores institucionais: Verde JC (`#005d3b`), Dourado (`#B09147`), fundo areia editorial (`#F2F2EB`) e superfícies brancas com bordas sutis (`#e2ded4`).
  - Tipografia: Serifada editorial para cabeçalhos (`STIX Two Text`) e `Montserrat`/`Lato` para controles e tabelas.
  - Números tabulares monospaçados (`tabular-nums`) para tamanhos, contagens de arquivos e carimbos de data/hora.

---

## 3. Principais Decisões de Produto e Arquitetura

- **Decisão 1: Normalização de Chaves e Pastas no Backend e Frontend**
  - *Abordagem*: Sanitizar strings de prefixo com regex (`name.replace(/\s+/g, ' ')`) para que variações como `BE  2462` e `BE 2462` sejam exibidas de forma unificada e seus arquivos internos sejam agregados sob a pasta correta.
  - *Benefício*: Evita confusão visual para o operador, preservando a navegação interna de todos os arquivos gravados.

- **Decisão 2: Endpoint de Auditoria e Verificação em Tempo Real (`/api/b2/verify`)**
  - *Abordagem*: Rota dedicada no Express que recebe o nome da pasta ou arquivo, dispara um `HeadObjectCommand` ou `ListObjectsV2Command` direcionado ao Backblaze e devolve o status real de existência, ETag, tamanho exato em bytes e data de modificação.
  - *Benefício*: O usuário nunca fica em dúvida se o arquivo já chegou ao Backblaze ou se ainda está pendente.

- **Decisão 3: Notificação Preventiva sobre o Cache da Interface Web do Backblaze**
  - *Abordagem*: Banner informativo e dica contextual no modal e no topo da lista B2 explicando que o console web da Backblaze possui cache local de página e necessita do botão "Sincronizar".
  - *Benefício*: Elimina chamados e dúvidas sobre tempo de sincronização.

---

## 4. Arquitetura Técnica e Estratégia de Dados

### Diagrama do Sistema

```
┌────────────────────────────────────────────────────────┐
│             Navegador / Cliente React                  │
│  - FileListView (Backblaze B2)                         │
│  - Botão "Verificar Integridade no B2"                 │
│  - Normalizador de Espaços Duplos (BE 2462)            │
│  - Dica de sincronização do console web                │
└───────────────────────┬────────────────────────────────┘
                        │
                        ▼ Chamadas HTTP (/api/b2/*)
┌────────────────────────────────────────────────────────┐
│             Servidor Express (server.ts)               │
│  - /api/b2/items (normalização de pastas)              │
│  - /api/b2/verify (auditoria ao vivo via S3)           │
│  - /api/transfer/execute (upload direto no S3)         │
└───────────────────────┬────────────────────────────────┘
                        │
                        ▼ AWS S3 Client (@aws-sdk/client-s3)
┌────────────────────────────────────────────────────────┐
│             Backblaze B2 (API S3 Compatível)           │
│  Bucket: JurisTVUpload (s3.us-west-002)                │
│  - Consistência Imediata (Read-after-Write)            │
│  - Chaves: BE 0005/*, BE 2462/*, Programas 2026/*      │
└────────────────────────────────────────────────────────┘
```

### Componentes Afetados
1. `server.ts`:
   - Endpoint `/api/b2/verify` para verificação direta de integridade.
   - Tratamento de prefixos com espaços normalizados no `/api/b2/items`.
2. `src/components/BackblazeStatusBar.tsx`:
   - Botão de verificação ao vivo de integridade e indicador de última checagem S3.
   - Dica visual sobre o botão "Sincronizar" no console oficial do Backblaze.
3. `src/components/FileListView.tsx` e `src/App.tsx`:
   - Normalização e desduplicação de pastas na listagem da nuvem Backblaze.
   - Badge de confirmação ao vivo quando um item foi verificado diretamente no S3.
4. `src/components/TransferModal.tsx`:
   - Mensagem de sucesso com esclarecimento sobre a atualização do console web da Backblaze.
