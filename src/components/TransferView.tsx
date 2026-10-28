import React, { useState } from 'react';
import { CloudProvider, FileItem, TransferQueueItem, B2ConnectionStatus } from '../types';
import { formatSize, getCloudLabel } from '../data';
import { FileIcon } from './FileIcon';

interface TransferViewProps {
  files: FileItem[];
  queue: TransferQueueItem[];
  onCopyFile: (fileId: number | string, targetCloud: CloudProvider) => void;
  b2Status?: B2ConnectionStatus | null;
  b2Bucket?: string;
  onB2BucketChange?: (bucket: string) => void;
}

export const TransferView: React.FC<TransferViewProps> = ({
  files,
  queue,
  onCopyFile,
  b2Status,
  b2Bucket = 'jctv.revistajc.com.br',
  onB2BucketChange: _onB2BucketChange,
}) => {
  const [selectedAzureId, setSelectedAzureId] = useState<number | string | null>(null);
  const [selectedBackblazeId, setSelectedBackblazeId] = useState<number | string | null>(null);
  const [isOverAzure, setIsOverAzure] = useState(false);
  const [isOverBackblaze, setIsOverBackblaze] = useState(false);

  const azureFiles = files.filter((f) => f.cloud === 'azure' && f.path === '/');
  const backblazeFiles = files.filter((f) => f.cloud === 'backblaze' && f.path === '/');

  const handleDragStart = (e: React.DragEvent, id: number | string) => {
    e.dataTransfer.setData('text/plain', String(id));
  };

  const handleDrop = (e: React.DragEvent, targetCloud: CloudProvider) => {
    e.preventDefault();
    setIsOverAzure(false);
    setIsOverBackblaze(false);
    const idStr = e.dataTransfer.getData('text/plain');
    if (idStr) {
      onCopyFile(idStr, targetCloud);
    }
  };

  return (
    <div className="space-y-6 font-['Montserrat',sans-serif]">
      {/* Head in Editorial Serif */}
      <div className="pb-1 border-b border-[#e5e1d7]">
        <h1 className="text-[32px] font-normal text-[#1f2124] leading-tight font-['STIX_Two_Text',serif]">
          Transferência entre Nuvens
        </h1>
        <p className="text-[#666666] text-xs mt-1">
          Arraste e copie arquivos entre Azure Blob Storage e Backblaze B2 no padrão editorial da Editora JC.
        </p>
      </div>

      {/* Note */}
      <div className="bg-[#fcfbfa] text-[#4a5568] p-3.5 rounded-xl text-xs leading-relaxed border border-[#e2ded4] flex items-center gap-2 shadow-2xs">
        <span className="font-bold text-[#005d3b]">⇄</span>
        <span>Operações em ambiente seguro. Transferências são replicadas de forma transparente.</span>
      </div>

      {/* Transfer Dual Panels */}
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_56px_minmax(0,1fr)] gap-4 items-center">
        {/* Azure Box */}
        <section
          onDragOver={(e) => {
            e.preventDefault();
            setIsOverAzure(true);
          }}
          onDragLeave={() => setIsOverAzure(false)}
          onDrop={(e) => handleDrop(e, 'azure')}
          className={`bg-white border rounded-2xl overflow-hidden shadow-2xs transition-all flex flex-col h-[420px] ${
            isOverAzure
              ? 'border-[#005d3b] ring-4 ring-[#005d3b]/10 bg-[#f7f5ef]'
              : 'border-[#e2ded4]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center gap-3 p-4 bg-white border-b border-[#e2ded4]">
            <div className="w-10 h-10 rounded-xl bg-[#005d3b] text-[#f3e8ce] flex items-center justify-center font-bold text-lg font-['STIX_Two_Text',serif] shadow-xs border border-[#B09147]/40">
              A
            </div>
            <div>
              <b className="block text-xs text-[#1f2124] font-bold font-['STIX_Two_Text',serif] text-sm">
                Microsoft Azure
              </b>
              <small className="block text-[#666666] text-xs">storagetvjustica · drive (Concedido)</small>
            </div>
          </div>

          {/* Subheader Path */}
          <div className="py-2 px-4 bg-[#fcfbfa] border-b border-[#e2ded4] text-xs font-semibold text-[#005d3b]">
            ▣ / drive /
          </div>

          {/* Draggable items list */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#f2efe6]">
            {azureFiles.map((file) => {
              const isSelected = selectedAzureId === file.id;
              return (
                <div
                  key={file.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, file.id)}
                  onClick={() => setSelectedAzureId(file.id)}
                  className={`flex items-center gap-3 px-4 py-2.5 text-xs cursor-grab active:cursor-grabbing transition-colors select-none ${
                    isSelected ? 'bg-[#f3e8ce]/40' : 'hover:bg-[#f9f8f5]'
                  }`}
                >
                  <FileIcon type={file.type} size="sm" />
                  <b className="flex-1 min-w-0 font-medium text-[#1f2124] truncate">{file.name}</b>
                  <small className="text-[#8c8273] flex-shrink-0">{formatSize(file.size)}</small>
                </div>
              );
            })}
            {azureFiles.length === 0 && (
              <div className="py-12 text-center text-xs text-[#888888]">Contêiner vazio</div>
            )}
          </div>
        </section>

        {/* Center Arrows */}
        <div className="flex md:flex-col justify-center items-center gap-3 py-2">
          <button
            onClick={() => {
              if (selectedAzureId) {
                onCopyFile(selectedAzureId, 'backblaze');
              }
            }}
            title="Copiar para Backblaze"
            className="w-11 h-11 bg-white hover:bg-[#f3e8ce]/50 border border-[#dcd7cb] rounded-xl flex items-center justify-center text-[#005d3b] text-xl font-bold shadow-2xs cursor-pointer transition-colors active:scale-95"
          >
            →
          </button>
          <button
            onClick={() => {
              if (selectedBackblazeId) {
                onCopyFile(selectedBackblazeId, 'azure');
              }
            }}
            title="Copiar para Azure"
            className="w-11 h-11 bg-white hover:bg-[#f3e8ce]/50 border border-[#dcd7cb] rounded-xl flex items-center justify-center text-[#005d3b] text-xl font-bold shadow-2xs cursor-pointer transition-colors active:scale-95"
          >
            ←
          </button>
        </div>

        {/* Backblaze Box */}
        <section
          onDragOver={(e) => {
            e.preventDefault();
            setIsOverBackblaze(true);
          }}
          onDragLeave={() => setIsOverBackblaze(false)}
          onDrop={(e) => handleDrop(e, 'backblaze')}
          className={`bg-white border rounded-2xl overflow-hidden shadow-2xs transition-all flex flex-col h-[420px] ${
            isOverBackblaze
              ? 'border-[#B09147] ring-4 ring-[#B09147]/10 bg-[#f7f5ef]'
              : 'border-[#e2ded4]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-white border-b border-[#e2ded4] gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#ac8f5c] text-white flex items-center justify-center font-bold text-lg font-['STIX_Two_Text',serif] shadow-xs">
                B
              </div>
              <div>
                <b className="block text-xs text-[#1f2124] font-bold font-['STIX_Two_Text',serif] text-sm">
                  Backblaze B2
                </b>
                <small className="block text-[#666666] text-xs">
                  {b2Status?.endpoint || 's3.us-west-002.backblazeb2.com'}
                </small>
              </div>
            </div>

            {/* Single Bucket Badge */}
            <span className="bg-[#f3e8ce] text-[#005d3b] border border-[#B09147]/50 rounded-lg px-2.5 py-1 text-xs font-bold">
              {b2Bucket}
            </span>
          </div>

          {/* Subheader Path */}
          <div className="py-2 px-4 bg-[#fcfbfa] border-b border-[#e2ded4] text-xs font-semibold text-[#ac8f5c] flex items-center justify-between">
            <span>▣ / {b2Bucket} /</span>
            <span className="text-[10px] text-[#777777] font-mono">
              ID: {b2Bucket === 'JurisTVUpload' ? 'fc2f97e0a7f0778e79ed0118' : '7c9f87805750d73e894d0118'}
            </span>
          </div>

          {/* Draggable items list */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#f2efe6]">
            {backblazeFiles.map((file) => {
              const isSelected = selectedBackblazeId === file.id;
              return (
                <div
                  key={file.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, file.id)}
                  onClick={() => setSelectedBackblazeId(file.id)}
                  className={`flex items-center gap-3 px-4 py-2.5 text-xs cursor-grab active:cursor-grabbing transition-colors select-none ${
                    isSelected ? 'bg-[#f3e8ce]/40' : 'hover:bg-[#f9f8f5]'
                  }`}
                >
                  <FileIcon type={file.type} size="sm" />
                  <b className="flex-1 min-w-0 font-medium text-[#1f2124] truncate">{file.name}</b>
                  <small className="text-[#8c8273] flex-shrink-0">{formatSize(file.size)}</small>
                </div>
              );
            })}
            {backblazeFiles.length === 0 && (
              <div className="py-12 text-center text-xs text-[#888888]">Bucket vazio</div>
            )}
          </div>
        </section>
      </div>

      {/* Transfer Queue Section */}
      <section className="bg-white border border-[#e2ded4] rounded-2xl p-6 shadow-2xs">
        <h3 className="text-base font-normal text-[#1f2124] mb-4 font-['STIX_Two_Text',serif]">
          Fila de Transferências
        </h3>
        {queue.length > 0 ? (
          <div className="space-y-1">
            {queue.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 py-3 border-t border-[#f0ece3] first:border-0"
              >
                <span className="text-sm text-[#005d3b] font-bold">⇄</span>
                <b className="flex-1 min-w-0 text-xs font-bold text-[#1f2124] truncate">
                  {item.name}
                </b>
                <small className="text-xs text-[#777777]">
                  {getCloudLabel(item.cloud)} → {getCloudLabel(item.to)}
                </small>
                <span className="bg-[#f3e8ce] text-[#005d3b] border border-[#B09147]/50 rounded-full px-2.5 py-0.5 text-[11px] font-bold flex items-center gap-1">
                  ✓ Concluído
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-[#888888] text-xs py-10">
            Fila vazia. Arraste um arquivo entre os painéis para iniciar a transferência.
          </div>
        )}
      </section>
    </div>
  );
};
