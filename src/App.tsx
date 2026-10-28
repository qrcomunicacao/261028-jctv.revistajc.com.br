import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CloudProvider, FileItem, PageId, TransferQueueItem, AzureConnectionStatus, B2ConnectionStatus, PaginationInfo } from './types';
import { INITIAL_FILES, formatSize } from './data';
import { LoginScreen } from './components/LoginScreen';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { FileListView } from './components/FileListView';
import { TransferView } from './components/TransferView';
import { ActivityView } from './components/ActivityView';
import { Toast } from './components/Toast';
import { TransferModal, TransferModalFile } from './components/TransferModal';

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('jc_auth_token') === 'true';
  });
  const [userEmail, setUserEmail] = useState<string>(() => {
    return localStorage.getItem('jc_auth_email') || 'atendimento@qrcomunicacao.com.br';
  });
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [files, setFiles] = useState<FileItem[]>(INITIAL_FILES);
  const [paths, setPaths] = useState<Record<CloudProvider, string>>({
    azure: '/',
    backblaze: '/',
  });
  const [queue, setQueue] = useState<TransferQueueItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Transfer Modal State with real confirmation & progress
  const [activeTransferModal, setActiveTransferModal] = useState<{
    isOpen: boolean;
    folderName: string;
    isFolder: boolean;
    sourceCloud: CloudProvider;
    targetCloud: CloudProvider;
  } | null>(null);

  // Azure State
  const [azureStatus, setAzureStatus] = useState<AzureConnectionStatus | null>(null);
  const [azureContainer, setAzureContainer] = useState<string>('drive');
  const [azurePage, setAzurePage] = useState<number>(1);
  const [azurePageSize, setAzurePageSize] = useState<number>(100);
  const [azureItems, setAzureItems] = useState<FileItem[]>([]);
  const [azurePagination, setAzurePagination] = useState<PaginationInfo | null>(null);
  const [isLoadingAzure, setIsLoadingAzure] = useState<boolean>(false);

  // Backblaze B2 State (Balde Único: jctv.revistajc.com.br)
  const [b2Status, setB2Status] = useState<B2ConnectionStatus | null>(null);
  const [b2Bucket, setB2Bucket] = useState<string>('jctv.revistajc.com.br');
  const [b2Items, setB2Items] = useState<FileItem[]>([]);
  const [isLoadingB2, setIsLoadingB2] = useState<boolean>(false);

  const nextIdRef = useRef<number>(100);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToastMessage(message);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // Fetch Azure connection status on load
  useEffect(() => {
    fetch('/api/azure/status')
      .then((res) => res.json())
      .then((data: AzureConnectionStatus) => {
        setAzureStatus(data);
        if (data.container) {
          setAzureContainer(data.container);
        }
      })
      .catch((err) => {
        console.warn('Could not load Azure status from backend API:', err);
      });
  }, []);

  // Fetch Backblaze B2 connection status on load
  const fetchB2Status = useCallback(() => {
    fetch('/api/b2/status')
      .then((res) => res.json())
      .then((data: B2ConnectionStatus) => {
        setB2Status(data);
        if (data.currentBucket) {
          setB2Bucket(data.currentBucket);
        }
      })
      .catch((err) => {
        console.warn('Could not load B2 status from backend API:', err);
      });
  }, []);

  useEffect(() => {
    fetchB2Status();
  }, [fetchB2Status]);

  // Fetch Backblaze B2 items
  const fetchB2Items = useCallback(async () => {
    setIsLoadingB2(true);
    try {
      const currentB2Path = paths.backblaze;
      const params = new URLSearchParams({
        bucket: b2Bucket,
        path: currentB2Path,
      });

      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim());
      }

      const res = await fetch(`/api/b2/items?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Status ${res.status}`);
      }
      const data = await res.json();

      const mappedItems: FileItem[] = (data.items || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        cloud: 'backblaze' as CloudProvider,
        size: item.size || 0,
        date: item.date || '27 out. 2026',
        path: item.path || currentB2Path,
        accessTier: item.accessTier || 'Standard',
        blobType: item.blobType || (item.type === 'folder' ? 'b2/folder' : 'b2/file'),
        contentType: item.contentType,
      }));

      setB2Items(mappedItems);
    } catch (err) {
      console.error('Error fetching B2 items:', err);
      showToast('Erro ao sincronizar com Backblaze B2.');
    } finally {
      setIsLoadingB2(false);
    }
  }, [b2Bucket, paths.backblaze, searchQuery]);

  useEffect(() => {
    fetchB2Items();
  }, [fetchB2Items]);

  // Fetch Azure items with pagination & filters
  const fetchAzureItems = useCallback(async () => {
    setIsLoadingAzure(true);
    try {
      const currentAzurePath = paths.azure;
      const params = new URLSearchParams({
        container: azureContainer,
        path: currentAzurePath,
        page: String(azurePage),
        pageSize: String(azurePageSize),
      });

      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim());
      }

      const res = await fetch(`/api/azure/items?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Status ${res.status}`);
      }
      const data = await res.json();

      const mappedItems: FileItem[] = (data.items || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        cloud: 'azure' as CloudProvider,
        size: item.size || 0,
        date: item.date || '25 nov. 2021',
        path: item.path || currentAzurePath,
        accessTier: item.accessTier || 'Cool',
        blobType: item.blobType || (item.type === 'folder' ? 'Diretório' : 'BlockBlob'),
        contentType: item.contentType,
      }));

      setAzureItems(mappedItems);
      setAzurePagination(data.pagination || null);
    } catch (err) {
      console.error('Error fetching Azure items:', err);
      showToast('Erro ao sincronizar com Azure Storage. Tentando novamente...');
    } finally {
      setIsLoadingAzure(false);
    }
  }, [azureContainer, paths.azure, azurePage, azurePageSize, searchQuery]);

  useEffect(() => {
    fetchAzureItems();
  }, [fetchAzureItems]);

  const handleLogin = (email: string) => {
    localStorage.setItem('jc_auth_token', 'true');
    localStorage.setItem('jc_auth_email', email);
    setUserEmail(email);
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
    showToast(`Login efetuado com sucesso (${email})`);
  };

  const handleLogout = () => {
    localStorage.removeItem('jc_auth_token');
    setIsAuthenticated(false);
    setCurrentPage('dashboard');
    setSearchQuery('');
    showToast('Sessão encerrada com sucesso.');
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setAzurePage(1); // Reset page on new search
    if (['dashboard', 'transfer', 'activity'].includes(currentPage)) {
      setCurrentPage('azure');
    }
  };

  const handlePathChange = (cloud: CloudProvider, newPath: string) => {
    setPaths((prev) => ({
      ...prev,
      [cloud]: newPath,
    }));
    if (cloud === 'azure') {
      setAzurePage(1); // Reset to page 1 on directory change
    }
  };

  const handleAzurePageChange = (newPage: number) => {
    setAzurePage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAzurePageSizeChange = (newSize: number) => {
    setAzurePageSize(newSize);
    setAzurePage(1);
  };

  const handleCopyFile = (fileId: number | string, dest: CloudProvider) => {
    // Look in either local files, azureItems or b2Items
    const file =
      files.find((f) => String(f.id) === String(fileId)) ||
      azureItems.find((f) => String(f.id) === String(fileId)) ||
      b2Items.find((f) => String(f.id) === String(fileId));

    if (!file) {
      showToast('Selecione um arquivo ou pasta');
      return;
    }
    if (file.cloud === dest) {
      showToast('O item já está na nuvem selecionada');
      return;
    }

    // Open detailed transfer confirmation & live progress modal
    setActiveTransferModal({
      isOpen: true,
      folderName: file.name,
      isFolder: file.type === 'folder',
      sourceCloud: file.cloud,
      targetCloud: dest,
    });
  };

  const handleTransferSuccess = (
    folderName: string,
    transferredFiles: TransferModalFile[],
    totalSize: number
  ) => {
    const cleanFolder = folderName.replace(/^\/|\/$/g, '').trim().replace(/\s+/g, ' ');
    const isFolder = activeTransferModal?.isFolder ?? true;
    const dest = activeTransferModal?.targetCloud ?? 'backblaze';
    const source = activeTransferModal?.sourceCloud ?? 'azure';

    if (isFolder) {
      const folderId = nextIdRef.current++;
      const destFolder: FileItem = {
        id: folderId,
        name: cleanFolder,
        type: 'folder',
        cloud: dest,
        path: '/',
        size: 0,
        date: '28 out. 2026',
        accessTier: dest === 'backblaze' ? 'Standard' : 'Cool',
        blobType: dest === 'backblaze' ? 'b2/folder' : 'Diretório',
      };

      const newChildFiles: FileItem[] = transferredFiles.map((f) => ({
        id: nextIdRef.current++,
        name: f.name.trim().replace(/\s+/g, ' '),
        type: f.type,
        cloud: dest,
        path: `/${cleanFolder}/`,
        size: f.size,
        date: f.date || '28 out. 2026',
        accessTier: dest === 'backblaze' ? 'Standard' : 'Cool',
        blobType: dest === 'backblaze' ? 'b2/file' : 'BlockBlob',
      }));

      const queueItem: TransferQueueItem = {
        id: folderId,
        name: `[Pasta Completa] ${cleanFolder} (${transferredFiles.length} arquivos)`,
        type: 'folder',
        cloud: source,
        to: dest,
        timestamp: '28 out. 2026, agora',
        size: totalSize,
      };

      setFiles((prev) => [...prev, destFolder, ...newChildFiles]);
      if (dest === 'backblaze') {
        setB2Items((prev) => [
          destFolder,
          ...prev.filter((item) => item.name.trim().replace(/\s+/g, ' ') !== cleanFolder),
        ]);
        fetchB2Items();
      }
      setQueue((prev) => [queueItem, ...prev]);
      showToast(
        `Pasta "${cleanFolder}" (${transferredFiles.length} arquivos · ${formatSize(totalSize)}) transferida para ${
          dest === 'azure' ? 'Azure' : 'Backblaze'
        }!`
      );
    } else {
      const newId = nextIdRef.current++;
      const singleFile = transferredFiles[0];
      const newFile: FileItem = {
        id: newId,
        name: cleanFolder,
        type: singleFile?.type || 'document',
        cloud: dest,
        path: '/',
        size: totalSize,
        date: '28 out. 2026',
        accessTier: dest === 'backblaze' ? 'Standard' : 'Cool',
        blobType: dest === 'backblaze' ? 'b2/file' : 'BlockBlob',
      };

      const queueItem: TransferQueueItem = {
        id: newId,
        name: cleanFolder,
        type: newFile.type,
        cloud: source,
        to: dest,
        timestamp: '28 out. 2026, agora',
        size: totalSize,
      };

      setFiles((prev) => [...prev, newFile]);
      if (dest === 'backblaze') {
        setB2Items((prev) => [
          newFile,
          ...prev.filter((item) => item.name.trim().replace(/\s+/g, ' ') !== cleanFolder),
        ]);
        fetchB2Items();
      }
      setQueue((prev) => [queueItem, ...prev]);
      showToast(
        `Arquivo "${cleanFolder}" (${formatSize(totalSize)}) transferido para ${
          dest === 'azure' ? 'Azure' : 'Backblaze'
        }!`
      );
    }
  };

  const handleNavigateToFolder = (cloud: CloudProvider, folderPath: string) => {
    setCurrentPage(cloud);
    handlePathChange(cloud, folderPath);
  };

  // Combine and deduplicate azureItems + backblaze items for transfer view & unified list
  const activeB2Files = React.useMemo(() => {
    const raw = b2Items.length > 0 ? b2Items : files.filter((f) => f.cloud === 'backblaze');
    const map = new Map<string, FileItem>();
    for (const item of raw) {
      const normalizedName = item.name.trim().replace(/\s+/g, ' ');
      const key = `${item.path}:${item.type}:${normalizedName}`;
      if (!map.has(key)) {
        map.set(key, { ...item, name: normalizedName });
      }
    }
    return Array.from(map.values());
  }, [b2Items, files]);

  const combinedFiles = [
    ...azureItems,
    ...activeB2Files,
  ];

  if (!isAuthenticated) {
    return (
      <>
        <LoginScreen onLogin={handleLogin} />
        <Toast message={toastMessage} />
      </>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F2F2EB] text-[#1f2124]">
      {/* Sidebar */}
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      {/* Main workspace */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Header with Search and user info */}
        <Header
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onLogout={handleLogout}
          userEmail={userEmail}
        />

        {/* Content area */}
        <div className="p-4 sm:p-7 lg:p-8 max-w-[1560px] w-full mx-auto flex-1">
          {currentPage === 'dashboard' && (
            <DashboardView
              files={combinedFiles}
              onNavigate={setCurrentPage}
              azureStatus={azureStatus}
              b2Status={b2Status}
              b2Bucket={b2Bucket}
            />
          )}

          {currentPage === 'all' && (
            <FileListView
              cloud={null}
              files={combinedFiles}
              searchQuery={searchQuery}
              paths={paths}
              onPathChange={handlePathChange}
              onCopyFile={handleCopyFile}
              onNavigate={setCurrentPage}
              onShowToast={showToast}
            />
          )}

          {currentPage === 'azure' && (
            <FileListView
              cloud="azure"
              files={azureItems}
              searchQuery={searchQuery}
              paths={paths}
              onPathChange={handlePathChange}
              onCopyFile={handleCopyFile}
              onNavigate={setCurrentPage}
              onShowToast={showToast}
              azureStatus={azureStatus}
              azureContainer={azureContainer}
              azurePagination={azurePagination}
              onAzurePageChange={handleAzurePageChange}
              onAzurePageSizeChange={handleAzurePageSizeChange}
              onRefreshAzure={fetchAzureItems}
              isLoadingAzure={isLoadingAzure}
            />
          )}

          {currentPage === 'backblaze' && (
            <FileListView
              cloud="backblaze"
              files={activeB2Files}
              searchQuery={searchQuery}
              paths={paths}
              onPathChange={handlePathChange}
              onCopyFile={handleCopyFile}
              onNavigate={setCurrentPage}
              onShowToast={showToast}
              b2Status={b2Status}
              b2Bucket={b2Bucket}
              onB2BucketChange={(newBucket) => {
                setB2Bucket(newBucket);
                handlePathChange('backblaze', '/');
              }}
              onRefreshB2={fetchB2Items}
              isLoadingB2={isLoadingB2}
            />
          )}

          {currentPage === 'transfer' && (
            <TransferView
              files={combinedFiles}
              queue={queue}
              onCopyFile={handleCopyFile}
              b2Status={b2Status}
              b2Bucket={b2Bucket}
              onB2BucketChange={setB2Bucket}
            />
          )}

          {currentPage === 'activity' && <ActivityView queue={queue} />}
        </div>
      </main>

      {/* Transfer Confirmation & Progress Modal */}
      {activeTransferModal && (
        <TransferModal
          isOpen={activeTransferModal.isOpen}
          onClose={() => setActiveTransferModal(null)}
          folderName={activeTransferModal.folderName}
          isFolder={activeTransferModal.isFolder}
          sourceCloud={activeTransferModal.sourceCloud}
          targetCloud={activeTransferModal.targetCloud}
          targetBucket={b2Bucket}
          onSuccess={handleTransferSuccess}
          onNavigateToFolder={handleNavigateToFolder}
        />
      )}

      {/* Floating Toast Notification */}
      <Toast message={toastMessage} />
    </div>
  );
};
