import React, { useState } from 'react';
import { AzureConnectionStatus } from '../types';
import { RefreshCw, CheckCircle2, ShieldCheck, Globe, KeyRound, ExternalLink, X, AlertCircle, Sparkles } from 'lucide-react';

interface AzureStatusBarProps {
  status: AzureConnectionStatus | null;
  onRefresh: () => void;
  isLoading: boolean;
}

export const AzureStatusBar: React.FC<AzureStatusBarProps> = ({
  status,
  onRefresh,
  isLoading,
}) => {
  const [showSasGuide, setShowSasGuide] = useState(false);

  if (!status) return null;

  return (
    <>
      <div className="bg-white border border-[#e2ded4] rounded-2xl p-4 sm:p-5 shadow-2xs mb-5 font-['Montserrat',sans-serif]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Account & Granted Access info */}
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#003823] to-[#005d3b] text-[#f3e8ce] flex items-center justify-center font-bold text-2xl shadow-xs border border-[#B09147]/40 flex-shrink-0 font-['STIX_Two_Text',serif]">
              A
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-[#1f2124] text-base font-['STIX_Two_Text',serif]">
                  {status.accountName}
                </span>

                {status.isLiveConnected ? (
                  <span className="inline-flex items-center gap-1 bg-[#005d3b] text-white text-xs font-semibold px-2.5 py-0.5 rounded-full border border-[#005d3b]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#f3e8ce]" />
                    Azure Live Conectado (drive)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-[#f3e8ce] text-[#005d3b] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#B09147]/50">
                    <Sparkles className="w-3.5 h-3.5 text-[#B09147]" />
                    drive (Concedido) · 5.687 itens indexados
                  </span>
                )}

                <span className="inline-flex items-center gap-1 bg-[#fbfaf8] text-[#333333] text-xs font-semibold px-2.5 py-0.5 rounded-md border border-[#e2ded4]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#005d3b]" />
                  {status.grantedTo}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#666666] mt-1 font-medium">
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-[#8c8273]" />
                  {status.region} ({status.subscription} · {status.resourceGroup})
                </span>
                <span>·</span>
                <span>Camada: <strong>{status.accessTierDefault}</strong></span>
                <span>·</span>
                <span>Lease: <strong className="text-[#005d3b] font-mono">{status.leaseState || 'leased'}</strong></span>
                <span>·</span>
                <span className="text-[#888888] font-mono text-[11px] truncate max-w-[320px]">
                  {status.containerUrl}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Quick actions */}
          <div className="flex items-center gap-2 self-end lg:self-auto flex-wrap">
            <button
              onClick={() => setShowSasGuide(true)}
              className="flex items-center gap-1.5 bg-[#fbfaf8] hover:bg-[#f3e8ce] text-[#005d3b] border border-[#dcd7cb] rounded-xl px-3.5 py-2 text-xs font-semibold shadow-2xs cursor-pointer transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#B09147]" />
              <span>Como funciona seu acesso concedido</span>
            </button>

            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center gap-1.5 bg-[#005d3b] hover:bg-[#00472e] text-white rounded-xl px-3.5 py-2 text-xs font-semibold shadow-2xs cursor-pointer transition-colors disabled:opacity-50 border border-[#B09147]/40"
              title="Atualizar lista de itens da Azure"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#f3e8ce]' : ''}`} />
              <span>Atualizar</span>
            </button>
          </div>
        </div>

        {/* Status diagnosis banner if token error or pending */}
        {!status.isLiveConnected && (
          <div className="mt-3.5 pt-3 border-t border-[#f0ece3] flex items-center justify-between flex-wrap gap-2 text-xs text-[#555555]">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#B09147] flex-shrink-0" />
              <span>
                {status.lastError ? (
                  <span className="text-rose-700 font-medium">Aviso Azure: {status.lastError}</span>
                ) : (
                  <span>
                    A navegação local e paginação dos <strong>5.687 itens</strong> do drive está ativa. Para buscar modificações ao vivo direto da API da Azure, insira o <strong>AZURE_STORAGE_SAS_TOKEN</strong> no arquivo <code>.env</code>.
                  </span>
                )}
              </span>
            </div>
            <button
              onClick={() => setShowSasGuide(true)}
              className="font-bold text-[#005d3b] hover:underline cursor-pointer"
            >
              Ver como colar no .env →
            </button>
          </div>
        )}
      </div>

      {/* Modal / Dialog in Editora JC / Revista JC style */}
      {showSasGuide && (
        <div className="fixed inset-0 bg-[#002b1b]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 font-['Montserrat',sans-serif]">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#e2ded4] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#ece8df] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-[#005d3b] text-[#B09147] flex items-center justify-center font-bold text-xs font-['STIX_Two_Text',serif]">
                  JC
                </div>
                <h3 className="font-normal text-base text-[#1f2124] font-['STIX_Two_Text',serif]">
                  Acesso Delegado: drive (Concedido)
                </h3>
              </div>
              <button
                onClick={() => setShowSasGuide(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-[#555555] leading-relaxed">
              <div className="bg-[#fbfaf8] p-4 rounded-xl border border-[#e8e4db] text-[#1f2124]">
                <p className="font-bold text-[#005d3b] mb-1 font-['STIX_Two_Text',serif] text-sm">
                  Identidade do Usuário: {status.grantedTo}
                </p>
                <p className="text-xs text-[#555555]">
                  Você recebeu permissão específica e delegada apenas para o contêiner <strong>drive</strong> e suas subpastas.
                  Por esse motivo, não é necessária a chave mestra de administrador da conta.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#1f2124] text-xs mb-1.5 font-['STIX_Two_Text',serif]">
                  Como o CloudBridge da Editora JC sincroniza:
                </h4>
                <ul className="list-disc list-inside space-y-1.5 text-[#555555]">
                  <li>O acervo indexa todos os <strong>5.687 diretórios</strong> (de <code>BE 0005</code> a <code>BE 5687</code>) diretamente na sua sessão.</li>
                  <li>Você pode navegar em qualquer pasta, abrir subpastas e transferir arquivos.</li>
                </ul>
              </div>

              <div className="bg-[#f8f7f4] p-3.5 rounded-xl border border-[#e2ded4]">
                <h4 className="font-bold text-[#005d3b] text-xs mb-1 flex items-center gap-1.5 font-['STIX_Two_Text',serif]">
                  <ExternalLink className="w-3.5 h-3.5 text-[#B09147]" />
                  Gerando SAS com 1 clique no Azure Storage Explorer:
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-[#666666] mt-1">
                  <li>No Storage Explorer, clique com o botão direito em <strong>drive (Concedido)</strong>.</li>
                  <li>Selecione <strong>"Obter Assinatura de Acesso Compartilhado (SAS)..."</strong>.</li>
                  <li>Marque as permissões desejadas e clique em Criar.</li>
                  <li>A URL gerada permite acesso direto autenticado com o seu próprio usuário.</li>
                </ol>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowSasGuide(false)}
                className="bg-[#005d3b] hover:bg-[#00472e] text-white font-bold px-5 py-2.5 rounded-xl text-xs cursor-pointer border border-[#B09147]/50"
              >
                Entendi, continuar navegando
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
