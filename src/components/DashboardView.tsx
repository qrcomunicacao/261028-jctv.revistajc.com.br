import React from 'react';
import { FileItem, PageId, AzureConnectionStatus, B2ConnectionStatus } from '../types';
import { formatSize, getCloudLabel } from '../data';
import { FileIcon } from './FileIcon';

interface DashboardViewProps {
  files: FileItem[];
  onNavigate: (page: PageId) => void;
  azureStatus?: AzureConnectionStatus | null;
  b2Status?: B2ConnectionStatus | null;
  b2Bucket?: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  files,
  onNavigate,
  azureStatus,
  b2Status,
  b2Bucket = 'jctv.revistajc.com.br',
}) => {
  const azureCount = azureStatus?.totalCachedItemsInDrive || 5687;
  const backblazeFiles = files.filter((f) => f.cloud === 'backblaze');

  const totalVideos = files.filter((f) => f.type === 'video').length;
  const totalStorage = files.reduce((s, f) => s + f.size, 0) + 148200;

  const metrics = [
    { label: 'Itens Indexados', value: `${(azureCount + backblazeFiles.length).toLocaleString('pt-BR')}`, glyph: '▤', subtitle: 'Azure (drive) + Backblaze B2' },
    { label: 'Diretórios Azure', value: `${azureCount.toLocaleString('pt-BR')}`, glyph: '📁', subtitle: 'BE 0005 a BE 5687' },
    { label: 'Arquivos de vídeo', value: `${totalVideos} catalogados`, glyph: '▶', subtitle: 'MP4, MOV, MXF e outros' },
    { label: 'Armazenamento total', value: formatSize(totalStorage), glyph: '◉', subtitle: 'Contas conectadas' },
  ];

  const recentFiles = files
    .filter((f) => f.type !== 'folder')
    .slice(-5)
    .reverse();

  return (
    <div className="space-y-6 font-['Montserrat',sans-serif]">
      {/* Page Heading in Editorial Serif */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-[#e5e1d7]">
        <div>
          <h1 className="text-[32px] font-normal text-[#1f2124] leading-tight font-['STIX_Two_Text',serif]">
            Visão Geral do Acervo
          </h1>
          <p className="text-[#666666] text-xs mt-1">
            Acompanhe seus arquivos, edições e armazenamento em um só lugar.
          </p>
        </div>
        <button
          onClick={() => onNavigate('transfer')}
          className="bg-[#005d3b] hover:bg-[#00472e] text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer shadow-xs border border-[#B09147]/50 flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <span>⇄</span> Transferir arquivos
        </button>
      </div>

      {/* Cloud Repositories Status Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Azure Sync Banner */}
        <div className="bg-[#fcfbfa] border border-[#e2ded4] text-[#1f2124] p-4 rounded-2xl text-xs leading-relaxed flex items-center justify-between flex-wrap gap-2 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#005d3b] text-[#f3e8ce] flex items-center justify-center font-bold text-xs font-['STIX_Two_Text',serif]">
              A
            </div>
            <div>
              <div className="text-[#333333]">
                Azure: <strong className="text-[#005d3b]">{azureStatus?.accountName || 'storagetvjustica'}</strong> · <strong className="text-[#005d3b]">drive (Concedido)</strong>
              </div>
              <small className="text-[#777777] block text-[11px]">
                <strong>{azureCount.toLocaleString('pt-BR')}</strong> diretórios com paginação ativa
              </small>
            </div>
          </div>
          <button
            onClick={() => onNavigate('azure')}
            className="font-bold text-[#005d3b] hover:text-[#00472e] hover:underline text-xs cursor-pointer flex items-center gap-1"
          >
            Explorar drive →
          </button>
        </div>

        {/* Backblaze B2 Banner */}
        <div className="bg-[#fcfbfa] border border-[#e2ded4] text-[#1f2124] p-4 rounded-2xl text-xs leading-relaxed flex items-center justify-between flex-wrap gap-2 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#ac8f5c] text-white flex items-center justify-center font-bold text-xs font-['STIX_Two_Text',serif]">
              B
            </div>
            <div>
              <div className="text-[#333333]">
                Backblaze B2: <strong className="text-[#005d3b]">{b2Bucket}</strong> ({b2Status?.endpoint || 's3.us-west-002.backblazeb2.com'})
              </div>
              <small className="text-[#777777] block text-[11px]">
                Balde único <strong>jctv.revistajc.com.br</strong> (ID: bcbf67c067a0872ea91d0118) · key: {b2Status?.keyName || 'rafael'}
              </small>
            </div>
          </div>
          <button
            onClick={() => onNavigate('backblaze')}
            className="font-bold text-[#005d3b] hover:text-[#00472e] hover:underline text-xs cursor-pointer flex items-center gap-1"
          >
            Explorar B2 →
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, idx) => (
          <div
            key={idx}
            className="bg-white border border-[#e2ded4] rounded-2xl p-5 shadow-2xs flex flex-col justify-between"
          >
            <div className="text-xl text-[#005d3b] font-bold">{m.glyph}</div>
            <small className="block text-[#777777] text-[11px] font-semibold uppercase tracking-wider mt-4 mb-1">
              {m.label}
            </small>
            <strong className="text-2xl lg:text-[28px] font-normal text-[#1f2124] tracking-tight font-['STIX_Two_Text',serif]">
              {m.value}
            </strong>
            <em className="block text-[#8c8273] text-[11px] not-italic mt-1.5 font-medium">
              {m.subtitle}
            </em>
          </div>
        ))}
      </div>

      {/* Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Storage by platform */}
        <section className="lg:col-span-7 bg-white border border-[#e2ded4] rounded-2xl p-6 shadow-2xs">
          <h3 className="text-base font-normal text-[#1f2124] mb-5 font-['STIX_Two_Text',serif]">
            Armazenamento por Plataforma
          </h3>
          <div className="space-y-4">
            {(['azure', 'backblaze'] as const).map((cloud) => {
              const isAzure = cloud === 'azure';
              const fileCount = isAzure ? azureCount : backblazeFiles.length;
              const folderCount = isAzure ? azureCount : backblazeFiles.filter((f) => f.type === 'folder').length;
              const cloudSize = isAzure ? 148200 : backblazeFiles.reduce((s, f) => s + f.size, 0);
              const barPercent = isAzure ? 88 : 42;

              return (
                <div
                  key={cloud}
                  className="flex items-center gap-4 py-4 border-t border-[#f0ece3] first:border-0"
                >
                  <div
                    className={`w-10 h-10 rounded-xl text-white flex items-center justify-center text-base font-black flex-shrink-0 font-['STIX_Two_Text',serif] shadow-xs ${
                      isAzure ? 'bg-[#005d3b]' : 'bg-[#ac8f5c]'
                    }`}
                  >
                    {isAzure ? 'A' : 'B'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#1f2124]">{getCloudLabel(cloud)}</span>
                      {isAzure && (
                        <span className="bg-[#f3e8ce] text-[#005d3b] text-[10px] px-2 py-0.5 rounded font-bold border border-[#B09147]/40">
                          storagetvjustica
                        </span>
                      )}
                    </div>
                    <small className="block text-[#777777] text-[11px] mt-0.5">
                      {isAzure ? `${azureCount.toLocaleString('pt-BR')} diretórios indexados` : `${fileCount} arquivos · ${folderCount} pastas`}
                    </small>
                    <div className="h-2 bg-[#f0eee6] rounded-full mt-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isAzure ? 'bg-[#005d3b]' : 'bg-[#ac8f5c]'}`}
                        style={{ width: `${barPercent}%` }}
                      />
                    </div>
                    <small className="block text-[#8c8273] text-[11px] mt-1.5 font-medium">
                      {formatSize(cloudSize)} {isAzure ? '(Camada Cool)' : 'armazenados'}
                    </small>
                  </div>

                  <button
                    onClick={() => onNavigate(cloud)}
                    className="bg-[#fbfaf8] hover:bg-[#f2efe6] border border-[#dcd7cb] rounded-xl w-9 h-9 flex items-center justify-center text-[#005d3b] font-bold text-base transition-colors cursor-pointer flex-shrink-0"
                    title={`Ver arquivos do ${getCloudLabel(cloud)}`}
                  >
                    →
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Recent files */}
        <section className="lg:col-span-5 bg-white border border-[#e2ded4] rounded-2xl p-6 shadow-2xs">
          <h3 className="text-base font-normal text-[#1f2124] mb-5 font-['STIX_Two_Text',serif]">
            Arquivos Recentes
          </h3>
          <div className="space-y-1">
            {recentFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 py-3 border-t border-[#f0ece3] first:border-0"
              >
                <FileIcon type={file.type} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs text-[#1f2124] truncate" title={file.name}>
                    {file.name}
                  </div>
                  <small className="block text-[#8c8273] text-[11px] mt-0.5">
                    {getCloudLabel(file.cloud)} · {formatSize(file.size)}
                  </small>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
