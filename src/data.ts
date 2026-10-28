import { FileItem, CloudProvider } from './types';

export const INITIAL_FILES: FileItem[] = [
  { id: 1, name: 'Clientes', type: 'folder', cloud: 'azure', size: 0, date: '26 out. 2026', path: '/' },
  { id: 2, name: 'Backups WordPress', type: 'folder', cloud: 'azure', size: 0, date: '26 out. 2026', path: '/' },
  { id: 3, name: 'Projetos 2026', type: 'folder', cloud: 'azure', size: 0, date: '26 out. 2026', path: '/' },
  { id: 4, name: 'campanha-institucional.mp4', type: 'video', cloud: 'azure', size: 1432, date: '26 out. 2026', path: '/' },
  { id: 5, name: 'relatorio-performance.pdf', type: 'pdf', cloud: 'azure', size: 18, date: '26 out. 2026', path: '/' },
  { id: 6, name: 'identidade-visual.png', type: 'image', cloud: 'azure', size: 8, date: '26 out. 2026', path: '/' },
  { id: 7, name: 'site-qr-backup.zip', type: 'zip', cloud: 'azure', size: 3200, date: '26 out. 2026', path: '/' },
  { id: 8, name: 'video-apresentacao.mov', type: 'video', cloud: 'azure', size: 980, date: '26 out. 2026', path: '/' },
  { id: 9, name: 'Arquivos de vídeo', type: 'folder', cloud: 'backblaze', size: 0, date: '26 out. 2026', path: '/' },
  { id: 10, name: 'Produção audiovisual', type: 'folder', cloud: 'backblaze', size: 0, date: '26 out. 2026', path: '/' },
  { id: 11, name: 'Arquivos históricos', type: 'folder', cloud: 'backblaze', size: 0, date: '26 out. 2026', path: '/' },
  { id: 12, name: 'reels-hassan-final.mp4', type: 'video', cloud: 'backblaze', size: 437, date: '26 out. 2026', path: '/' },
  { id: 13, name: 'backup-projetos-2025.zip', type: 'zip', cloud: 'backblaze', size: 8100, date: '26 out. 2026', path: '/' },
  { id: 14, name: 'fotografia-gastronomica.jpg', type: 'image', cloud: 'backblaze', size: 12, date: '26 out. 2026', path: '/' },
  { id: 15, name: 'evento-seminario.mp4', type: 'video', cloud: 'backblaze', size: 2480, date: '26 out. 2026', path: '/' },
  { id: 16, name: 'briefing-cliente.pdf', type: 'pdf', cloud: 'backblaze', size: 4, date: '26 out. 2026', path: '/' },
];

export function formatSize(n: number): string {
  if (!n) return '—';
  if (n >= 1048576) {
    return (n / 1048576).toFixed(2) + ' TB';
  }
  if (n >= 1024) {
    return (n / 1024).toFixed(2) + ' GB';
  }
  return n + ' MB';
}

export function getCloudLabel(cloud: CloudProvider): string {
  return cloud === 'azure' ? 'Microsoft Azure' : 'Backblaze B2';
}
