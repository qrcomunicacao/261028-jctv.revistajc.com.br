import React from 'react';
import { TransferQueueItem } from '../types';
import { getCloudLabel, formatSize } from '../data';

interface ActivityViewProps {
  queue: TransferQueueItem[];
}

export const ActivityView: React.FC<ActivityViewProps> = ({ queue }) => {
  return (
    <div className="space-y-6 font-['Montserrat',sans-serif]">
      <div className="pb-1 border-b border-[#e5e1d7]">
        <h1 className="text-[32px] font-normal text-[#1f2124] leading-tight font-['STIX_Two_Text',serif]">
          Atividades Recentes
        </h1>
        <p className="text-[#666666] text-xs mt-1">
          Histórico e auditoria das operações de arquivos feitas nesta sessão.
        </p>
      </div>

      <section className="bg-white border border-[#e2ded4] rounded-2xl p-6 shadow-2xs">
        <h3 className="text-base font-normal text-[#1f2124] mb-4 font-['STIX_Two_Text',serif]">
          Transferências & Sincronizações
        </h3>
        {queue.length > 0 ? (
          <div className="space-y-1">
            {queue.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 py-3 border-t border-[#f0ece3] first:border-0"
              >
                <span className="text-sm text-[#005d3b] font-bold">⇄</span>
                <div className="flex-1 min-w-0">
                  <b className="block text-xs font-bold text-[#1f2124] truncate">{item.name}</b>
                  <small className="block text-[#8c8273] text-[11px] mt-0.5">
                    {item.timestamp} · {formatSize(item.size)}
                  </small>
                </div>
                <small className="hidden sm:inline text-xs text-[#666666]">
                  {getCloudLabel(item.cloud)} → {getCloudLabel(item.to)}
                </small>
                <span className="bg-[#f3e8ce] text-[#005d3b] border border-[#B09147]/40 rounded-full px-2.5 py-0.5 text-[11px] font-bold">
                  ✓ Registrado
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-[#888888] text-xs py-12">
            Nenhuma atividade registrada na sessão atual.
          </div>
        )}
      </section>
    </div>
  );
};
