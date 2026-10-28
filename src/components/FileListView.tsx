import React, { useState, useMemo } from 'react';
import { CloudProvider, FileItem, FilterType, ViewMode, PageId, PaginationInfo, AzureConnectionStatus, B2ConnectionStatus } from '../types';
import { formatSize, getCloudLabel } from '../data';
import { FileIcon } from './FileIcon';
import { AzureStatusBar } from './AzureStatusBar';
import { BackblazeStatusBar } from './BackblazeStatusBar';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FolderOpen,
  ArrowRightLeft,
  Layers,
  CheckCircle2,
  SearchCheck,
} from 'lucide-react';

interface FileListViewProps {
  cloud: CloudProvider | null;
  files: FileItem[];
  searchQuery: string;
  paths: Record<CloudProvider, string>;
  onPathChange: (cloud: CloudProvider, path: string) => void;
  onCopyFile: (fileId: number | string, targetCloud: CloudProvider) => void;
  onNavigate: (page: PageId) => void;
  onShowToast: (msg: string) => void;

  // Azure-specific server pagination & connection props
  azureStatus?: AzureConnectionStatus | null;
  azureContainer?: string;
  azurePagination?: PaginationInfo | null;
  onAzurePageChange?: (page: number) => void;
  onAzurePageSizeChange?: (pageSize: number) => void;
  onRefreshAzure?: () => void;
  isLoadingAzure?: boolean;

  // Backblaze-specific props
  b2Status?: B2ConnectionStatus | null;
  b2Bucket?: string;
  onB2BucketChange?: (bucket: string) => void;
  onRefreshB2?: () => void;
  isLoadingB2?: boolean;
}

export const FileListView: React.FC<FileListViewProps> = ({
  cloud,
  files,
  searchQuery,
  paths,
  onPathChange,
  onCopyFile,
  onNavigate,
  onShowToast,
  azureStatus,
  azureContainer = 'drive',
  azurePagination,
  onAzurePageChange,
  onAzurePageSizeChange,
  onRefreshAzure,
  isLoadingAzure = false,
  b2Status,
  b2Bucket = 'JurisTVUpload',
  onB2BucketChange,
  onRefreshB2,
  isLoadingB2 = false,
}) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedId, setSelectedId] = useState<number | string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [verifyingId, setVerifyingId] = useState<number | string | null>(null);
  const [verifiedItems, setVerifiedItems] = useState<
    Record<string, { verified: boolean; count: number; bytes: number; at: string }>
  >({});

  const currentPath = cloud ? paths[cloud] : '/';

  const isAzureView = cloud === 'azure';
  const isB2View = cloud === 'backblaze';

  const filteredLocalFiles = files
    .filter((f) => {
      if (cloud && f.cloud !== cloud) return false;
      if (cloud && f.path !== currentPath) return false;
      if (filter !== 'all' && f.type !== filter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return f.name.toLowerCase().includes(q) || f.type.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;
      return a.name.localeCompare(b.name);
    });

  // Deduplicate and normalize multi-spaced names for both views
  const displayedFiles = useMemo(() => {
    const raw = (isAzureView || isB2View)
      ? files.filter((f) => {
          if (filter !== 'all' && f.type !== filter) return false;
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            return f.name.toLowerCase().includes(q) || f.type.toLowerCase().includes(q);
          }
          return true;
        })
      : filteredLocalFiles;

    const map = new Map<string, FileItem>();
    for (const item of raw) {
      const normalizedName = item.name.trim().replace(/\s+/g, ' ');
      const key = `${item.cloud}:${item.path}:${item.type}:${normalizedName}`;
      if (!map.has(key)) {
        map.set(key, { ...item, name: normalizedName });
      }
    }
    return Array.from(map.values());
  }, [isAzureView, isB2View, files, filter, searchQuery, filteredLocalFiles]);

  const handleVerifyItem = async (item: FileItem) => {
    setVerifyingId(item.id);
    try {
      const cleanItemName = item.name.trim().replace(/\s+/g, ' ');
      const fullPath = item.path === '/' ? cleanItemName : `${item.path.replace(/^\/|\/$/g, '')}/${cleanItemName}`;

      const res = await fetch('/api/b2/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bucket: b2Bucket,
          path: fullPath,
          isFolder: item.type === 'folder',
        }),
      });

      const data = await res.json();
      setVerifiedItems((prev) => ({
        ...prev,
        [String(item.id)]: {
          verified: data.verified,
          count: data.totalObjects || 0,
          bytes: data.totalBytes || 0,
          at: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        },
      }));

      onShowToast(
        data.verified
          ? `✓ "${cleanItemName}" confirmado na nuvem Backblaze B2 (${data.totalObjects} arquivo(s))`
          : `Item não encontrado no bucket ${b2Bucket}`
      );
    } catch (err) {
      console.error('Error verifying item on B2:', err);
      onShowToast('Erro ao consultar API Backblaze');
    } finally {
      setVerifyingId(null);
    }
  };

  const selectedFile = displayedFiles.find((f) => String(f.id) === String(selectedId)) || null;

  const handleItemClick = (id: number | string) => {
    setSelectedId(id);
  };

  const handleItemDoubleClick = (item: FileItem) => {
    if (item.type === 'folder') {
      const folderName = item.name.replace(/^\/|\/$/g, '');
      const newPath = currentPath === '/' ? `/${folderName}/` : `${currentPath}${folderName}/`;
      if (cloud) {
        onPathChange(cloud, newPath);
      }
      setSelectedId(null);
    } else {
      onShowToast(`Arquivo "${item.name}" selecionado (${formatSize(item.size)})`);
    }
  };

  const handleNavigatePathSegment = (targetIndex: number, segments: string[]) => {
    if (!cloud) return;
    if (targetIndex === -1) {
      onPathChange(cloud, '/');
    } else {
      const newPath = '/' + segments.slice(0, targetIndex + 1).join('/') + '/';
      onPathChange(cloud, newPath);
    }
    setSelectedId(null);
  };

  const chips: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'Todos' },
    { id: 'folder', label: 'Pastas' },
    { id: 'video', label: 'Vídeos' },
    { id: 'image', label: 'Imagens' },
    { id: 'pdf', label: 'PDFs' },
  ];

  const title = cloud ? getCloudLabel(cloud) : 'Todos os arquivos';
  const subtitle = isAzureView
    ? 'Exploração com paginação oficial e sincronização do Azure Blob Storage.'
    : isB2View
    ? `Balde ${b2Bucket} (bcbf67c067a0872ea91d0118) na região us-west-002.`
    : 'Navegue, pesquise e organize arquivos das duas nuvens.';

  const pathClean = currentPath.replace(/^\/|\/$/g, '');
  const pathSegments = pathClean ? pathClean.split('/') : [];

  return (
    <div className="space-y-5 font-['Montserrat',sans-serif]">
      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-[#e5e1d7]">
        <div>
          <h1 className="text-[32px] font-normal text-[#1f2124] leading-tight font-['STIX_Two_Text',serif]">
            {title}
          </h1>
          <p className="text-[#666666] text-xs mt-1">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            className="bg-[#fbfaf8] hover:bg-[#f2efe6] border border-[#dcd7cb] rounded-xl px-4 py-2 text-xs font-semibold text-[#1f2124] transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
          >
            {viewMode === 'list' ? '▦ Grade' : '☷ Lista'}
          </button>
          <button
            onClick={() => onNavigate('transfer')}
            className="bg-[#005d3b] hover:bg-[#00472e] text-white rounded-xl px-4 py-2 text-xs font-bold transition-colors cursor-pointer shadow-xs border border-[#B09147]/50 flex items-center gap-1.5"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Transferir</span>
          </button>
        </div>
      </div>

      {/* Azure Connection Status Bar (if viewing Azure) */}
      {isAzureView && azureStatus && (
        <AzureStatusBar
          status={azureStatus}
          onRefresh={() => onRefreshAzure && onRefreshAzure()}
          isLoading={isLoadingAzure}
        />
      )}

      {/* Backblaze Connection Status Bar (if viewing Backblaze) */}
      {isB2View && b2Status && (
        <BackblazeStatusBar
          status={b2Status}
          selectedBucket={b2Bucket}
          onBucketChange={(bucket) => onB2BucketChange && onB2BucketChange(bucket)}
          onRefresh={() => onRefreshB2 && onRefreshB2()}
          isLoading={isLoadingB2}
        />
      )}

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => {
            const isActive = filter === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => {
                  setFilter(chip.id);
                  setSelectedId(null);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#005d3b] text-white shadow-2xs'
                    : 'bg-[#fbfaf8] text-[#555555] hover:bg-[#f2efe6] border border-[#dcd7cb]'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* Page Size Selector (When viewing Azure) */}
        {isAzureView && azurePagination && onAzurePageSizeChange && (
          <div className="flex items-center gap-2 text-xs font-semibold text-[#666666]">
            <Layers className="w-3.5 h-3.5 text-[#005d3b]" />
            <span>Itens por página:</span>
            <select
              value={azurePagination.pageSize}
              onChange={(e) => onAzurePageSizeChange(Number(e.target.value))}
              className="bg-white border border-[#dcd7cb] rounded-lg px-2.5 py-1 text-xs font-bold text-[#1f2124] outline-none cursor-pointer"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </div>
        )}
      </div>

      {/* Main File Layout */}
      <div className={`grid gap-4 ${selectedFile ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>
        {/* Left / Center: File box */}
        <section
          className={`bg-white border border-[#e2ded4] rounded-2xl overflow-hidden shadow-2xs ${
            selectedFile ? 'lg:col-span-8 xl:col-span-9' : 'w-full'
          }`}
        >
          {/* Breadcrumb Bar */}
          <div className="p-3.5 px-5 text-[#555555] font-semibold text-xs border-b border-[#e2ded4] bg-[#fcfbfa] flex items-center gap-1.5 flex-wrap">
            <span className="flex items-center gap-1.5 font-bold text-[#1f2124]">
              ☁ {cloud ? getCloudLabel(cloud) : 'Todas as nuvens'}
            </span>
            {isAzureView && (
              <>
                <span>/</span>
                <span className="bg-[#f3e8ce] text-[#005d3b] px-2 py-0.5 rounded font-bold border border-[#B09147]/40">
                  drive (Concedido)
                </span>
              </>
            )}
            {isB2View && (
              <>
                <span>/</span>
                <span className="bg-[#f3e8ce] text-[#005d3b] px-2 py-0.5 rounded font-bold border border-[#B09147]/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#005d3b]"></span>
                  {b2Bucket}
                </span>
              </>
            )}
            <span>/</span>
            <button
              onClick={() => handleNavigatePathSegment(-1, [])}
              className={`px-2 py-0.5 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                pathSegments.length === 0
                  ? 'bg-[#005d3b] text-white font-bold'
                  : 'bg-[#f0eee8] hover:bg-[#e4e0d5] text-[#333333]'
              }`}
            >
              Início
            </button>

            {pathSegments.map((segment, idx) => (
              <React.Fragment key={idx}>
                <span>/</span>
                <button
                  onClick={() => handleNavigatePathSegment(idx, pathSegments)}
                  className={`px-2 py-0.5 rounded-md text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1 ${
                    idx === pathSegments.length - 1
                      ? 'bg-[#005d3b] text-white font-bold'
                      : 'bg-[#f0eee8] hover:bg-[#e4e0d5] text-[#333333]'
                  }`}
                >
                  <FolderOpen className="w-3 h-3 text-[#B09147] inline" />
                  {segment}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* Loading Overlay if fetching */}
          {(isLoadingAzure || isLoadingB2) && (
            <div className="py-12 flex flex-col items-center justify-center text-slate-500 gap-3">
              <div
                className={`w-8 h-8 border-3 ${
                  isB2View ? 'border-[#ac8f5c]' : 'border-[#005d3b]'
                } border-t-transparent rounded-full animate-spin`}
              />
              <span
                className={`text-xs font-medium ${
                  isB2View ? 'text-[#ac8f5c]' : 'text-[#005d3b]'
                }`}
              >
                {isB2View
                  ? `Sincronizando itens com Backblaze B2 (${b2Bucket})...`
                  : 'Sincronizando itens com Microsoft Azure...'}
              </span>
            </div>
          )}

          {/* Grid View */}
          {!(isLoadingAzure || isLoadingB2) && viewMode === 'grid' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-5">
              {displayedFiles.map((item) => {
                const isSelected = String(selectedId) === String(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    onDoubleClick={() => handleItemDoubleClick(item)}
                    className={`p-3.5 rounded-xl text-left min-h-[110px] transition-all cursor-pointer flex flex-col justify-between border ${
                      isSelected
                        ? 'bg-[#f3e8ce]/40 border-[#005d3b] ring-2 ring-[#005d3b]/20'
                        : 'bg-[#fcfbfa] border-[#e8e4db] hover:bg-[#f7f5ef]'
                    }`}
                  >
                    <FileIcon type={item.type} size="md" />
                    <div>
                      <b className="block text-xs text-[#1f2124] font-bold break-all line-clamp-2 mt-2.5">
                        {item.name}
                      </b>
                      <div className="flex items-center justify-between text-[11px] text-[#8c8273] mt-1">
                        <span>{formatSize(item.size)}</span>
                        {item.accessTier && (
                          <span className="font-mono text-[10px] bg-[#f0eee8] px-1.5 py-0.2 rounded text-[#555]">
                            {item.accessTier}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Table View (Formatted to match Azure Storage Explorer / Backblaze + Editora JC style) */}
          {!(isLoadingAzure || isLoadingB2) && viewMode === 'list' && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-[#f7f6f1] border-b border-[#e2ded4]">
                    <th className="text-[11px] font-bold text-[#666666] uppercase tracking-wider py-3 px-5">
                      Nome
                    </th>
                    {(isAzureView || isB2View) && (
                      <th className="hidden lg:table-cell text-[11px] font-bold text-[#666666] uppercase tracking-wider py-3 px-3">
                        {isB2View ? 'Classe B2' : 'Camada de Acesso'}
                      </th>
                    )}
                    <th className="hidden sm:table-cell text-[11px] font-bold text-[#666666] uppercase tracking-wider py-3 px-4">
                      {isAzureView ? 'Hora da Última Modificação' : 'Modificado'}
                    </th>
                    {(isAzureView || isB2View) && (
                      <th className="hidden xl:table-cell text-[11px] font-bold text-[#666666] uppercase tracking-wider py-3 px-3">
                        {isB2View ? 'Tipo Objeto B2' : 'Tipo de Blob'}
                      </th>
                    )}
                    <th className="text-[11px] font-bold text-[#666666] uppercase tracking-wider py-3 px-4">
                      Tamanho
                    </th>
                    {!isAzureView && !isB2View && (
                      <th className="hidden md:table-cell text-[11px] font-bold text-[#666666] uppercase tracking-wider py-3 px-5">
                        Origem
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {displayedFiles.map((item) => {
                    const isSelected = String(selectedId) === String(item.id);
                    return (
                      <tr
                        key={item.id}
                        onClick={() => handleItemClick(item.id)}
                        onDoubleClick={() => handleItemDoubleClick(item)}
                        className={`border-b border-[#f0ece3] cursor-pointer select-none transition-colors ${
                          isSelected ? 'bg-[#f3e8ce]/40' : 'hover:bg-[#f9f8f5]'
                        }`}
                      >
                        <td className="py-2.5 px-5 text-xs font-bold text-[#1f2124] flex items-center gap-3">
                          <FileIcon type={item.type} size="sm" />
                          <span className="truncate max-w-[260px] sm:max-w-xs">{item.name}</span>
                        </td>

                        {(isAzureView || isB2View) && (
                          <td className="hidden lg:table-cell py-2.5 px-3 text-xs text-[#555555]">
                            <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-[#f0eee8] text-[#333]">
                              {item.accessTier || (isB2View ? 'Standard' : 'Cool')}
                            </span>
                          </td>
                        )}

                        <td className="hidden sm:table-cell py-2.5 px-4 text-xs text-[#666666]">
                          {item.date}
                        </td>

                        {(isAzureView || isB2View) && (
                          <td className="hidden xl:table-cell py-2.5 px-3 text-xs text-[#666666]">
                            {item.blobType || (item.type === 'folder' ? 'Diretório' : (isB2View ? 'b2/file' : 'BlockBlob'))}
                          </td>
                        )}

                        <td className="py-2.5 px-4 text-xs text-[#666666]">
                          {formatSize(item.size)}
                        </td>

                        {!isAzureView && !isB2View && (
                          <td className="hidden md:table-cell py-2.5 px-5 text-xs text-[#666666]">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                                item.cloud === 'azure'
                                  ? 'bg-[#f3e8ce] text-[#005d3b] border border-[#B09147]/40'
                                  : 'bg-[#fbfaf8] text-[#ac8f5c] border border-[#e2ded4]'
                              }`}
                            >
                              {getCloudLabel(item.cloud)}
                            </span>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Empty state */}
          {!(isLoadingAzure || isLoadingB2) && displayedFiles.length === 0 && (
            <div className="py-16 text-center text-[#888888] text-sm">
              Nenhum item encontrado nesta página.
            </div>
          )}

          {/* Footer Bar with Official Pagination Controls */}
          <div className="p-3.5 px-5 bg-[#fcfbfa] text-[#666666] text-xs border-t border-[#e2ded4] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="font-medium">
              {isAzureView && azurePagination ? (
                <span>
                  Mostrando{' '}
                  <strong className="text-[#005d3b]">{azurePagination.startIndex}</strong> a{' '}
                  <strong className="text-[#005d3b]">{azurePagination.endIndex}</strong> de{' '}
                  <strong className="text-[#005d3b]">{azurePagination.totalItems}</strong> itens armazenados em cache
                </span>
              ) : (
                <span>{displayedFiles.length} itens listados · Clique para detalhes · Duplo clique para abrir</span>
              )}
            </div>

            {/* Pagination Button Navigation */}
            {isAzureView && azurePagination && onAzurePageChange && (
              <div className="flex items-center gap-1.5 select-none">
                <button
                  onClick={() => onAzurePageChange(1)}
                  disabled={azurePagination.currentPage <= 1 || isLoadingAzure}
                  className="w-8 h-8 rounded-lg border border-[#dcd7cb] bg-white hover:bg-[#f6f4ee] flex items-center justify-center text-[#1f2124] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
                  title="Primeira página"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onAzurePageChange(azurePagination.currentPage - 1)}
                  disabled={!azurePagination.hasPreviousPage || isLoadingAzure}
                  className="w-8 h-8 rounded-lg border border-[#dcd7cb] bg-white hover:bg-[#f6f4ee] flex items-center justify-center text-[#1f2124] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
                  title="Página anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="px-3 py-1 bg-white border border-[#dcd7cb] rounded-lg text-xs font-bold text-[#1f2124] flex items-center gap-1 shadow-2xs">
                  <span>Página</span>
                  <span className="text-[#005d3b] font-extrabold">{azurePagination.currentPage}</span>
                  <span>de</span>
                  <span>{azurePagination.totalPages}</span>
                </div>

                <button
                  onClick={() => onAzurePageChange(azurePagination.currentPage + 1)}
                  disabled={!azurePagination.hasNextPage || isLoadingAzure}
                  className="w-8 h-8 rounded-lg border border-[#dcd7cb] bg-white hover:bg-[#f6f4ee] flex items-center justify-center text-[#1f2124] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
                  title="Próxima página"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onAzurePageChange(azurePagination.totalPages)}
                  disabled={azurePagination.currentPage >= azurePagination.totalPages || isLoadingAzure}
                  className="w-8 h-8 rounded-lg border border-[#dcd7cb] bg-white hover:bg-[#f6f4ee] flex items-center justify-center text-[#1f2124] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
                  title="Última página"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Right Detail Pane */}
        {selectedFile && (
          <aside className="lg:col-span-4 xl:col-span-3 bg-white border border-[#e2ded4] rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#e2ded4] mb-4">
                <h3 className="font-normal text-base text-[#1f2124] font-['STIX_Two_Text',serif]">
                  Detalhes do Item
                </h3>
                <button
                  onClick={() => setSelectedId(null)}
                  className="w-7 h-7 rounded-lg hover:bg-[#f0eee8] text-slate-500 font-bold flex items-center justify-center transition-colors cursor-pointer text-sm"
                  title="Fechar detalhes"
                >
                  ✕
                </button>
              </div>

              {/* Preview Box */}
              <div className="h-[140px] bg-[#fcfbfa] rounded-xl flex items-center justify-center mb-4 border border-[#e8e4db]">
                <FileIcon type={selectedFile.type} size="xl" className="bg-transparent" />
              </div>

              {/* File properties */}
              <strong className="block text-sm font-bold text-[#1f2124] break-words mb-3">
                {selectedFile.name}
              </strong>

              <div className="space-y-3 text-xs">
                <div>
                  <small className="block text-[#777777] uppercase font-bold text-[10px]">
                    Tipo
                  </small>
                  <b className="text-[#1f2124]">
                    {selectedFile.type === 'folder' ? 'Pasta / Diretório' : selectedFile.type.toUpperCase()}
                  </b>
                </div>
                <div>
                  <small className="block text-[#777777] uppercase font-bold text-[10px]">
                    Armazenamento
                  </small>
                  <b className="text-[#005d3b]">{getCloudLabel(selectedFile.cloud)}</b>
                </div>
                {selectedFile.accessTier && (
                  <div>
                    <small className="block text-[#777777] uppercase font-bold text-[10px]">
                      Camada de Acesso
                    </small>
                    <b className="text-[#1f2124]">{selectedFile.accessTier}</b>
                  </div>
                )}
                <div>
                  <small className="block text-[#777777] uppercase font-bold text-[10px]">
                    Tamanho
                  </small>
                  <b className="text-[#1f2124]">{formatSize(selectedFile.size)}</b>
                </div>
                <div>
                  <small className="block text-[#777777] uppercase font-bold text-[10px]">
                    Caminho / Contêiner
                  </small>
                  <b className="text-[#555555] font-mono text-[11px] break-all">
                    {selectedFile.cloud === 'azure' ? `${azureContainer}:${selectedFile.path}` : selectedFile.path}
                  </b>
                </div>

                {/* Backblaze Live S3 Verification Status */}
                {selectedFile.cloud === 'backblaze' && (
                  <div className="pt-2">
                    {verifiedItems[String(selectedFile.id)]?.verified ? (
                      <div className="bg-[#f3e8ce] border border-[#B09147]/50 rounded-xl p-2.5 text-[11px] text-[#005d3b]">
                        <div className="flex items-center gap-1.5 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#005d3b]" />
                          <span>Confirmado no Backblaze B2</span>
                        </div>
                        <div className="text-[10px] text-[#555] mt-0.5">
                          {verifiedItems[String(selectedFile.id)].count} arquivo(s) gravados · Verificado às {verifiedItems[String(selectedFile.id)].at}
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleVerifyItem(selectedFile)}
                        disabled={verifyingId === selectedFile.id}
                        className="w-full flex items-center justify-center gap-1.5 bg-[#fbfaf8] hover:bg-[#f3e8ce] text-[#005d3b] border border-[#dcd7cb] rounded-xl py-2 px-3 text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <SearchCheck className={`w-3.5 h-3.5 ${verifyingId === selectedFile.id ? 'animate-pulse' : ''}`} />
                        <span>{verifyingId === selectedFile.id ? 'Auditando S3...' : 'Verificar no Backblaze B2'}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[#e2ded4] space-y-2">
              <button
                onClick={() =>
                  onCopyFile(selectedFile.id, selectedFile.cloud === 'azure' ? 'backblaze' : 'azure')
                }
                className="w-full bg-[#005d3b] hover:bg-[#00472e] text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2 border border-[#B09147]/50"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Copiar para outra nuvem</span>
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
