import React, { useState } from 'react';
import { B2ConnectionStatus, B2VerifyResult } from '../types';
import { formatSize } from '../data';
import {
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  Globe,
  KeyRound,
  ExternalLink,
  X,
  AlertCircle,
  Database,
  SearchCheck,
  Info,
} from 'lucide-react';

interface BackblazeStatusBarProps {
  status: B2ConnectionStatus | null;
  selectedBucket: string;
  onBucketChange?: (bucket: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const BackblazeStatusBar: React.FC<BackblazeStatusBarProps> = ({
  status,
  selectedBucket,
  onBucketChange: _onBucketChange,
  onRefresh,
  isLoading,
}) => {
  const [showKeyGuide, setShowKeyGuide] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<B2VerifyResult | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  if (!status) return null;

  const currentBucketObj = status.buckets.find((b) => b.name === selectedBucket) || status.buckets[0];

  const handleVerifyBucket = async () => {
    setIsVerifying(true);
    try {
      const res = await fetch('/api/b2/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bucket: selectedBucket,
          path: '',
          isFolder: true,
        }),
      });
      const data: B2VerifyResult = await res.json();
      setVerifyResult(data);
      setShowVerifyModal(true);
    } catch (err) {
      console.error('Error verifying B2:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <>
      <div className="bg-white border border-[#e2ded4] rounded-2xl p-4 sm:p-5 shadow-2xs mb-5 font-['Montserrat',sans-serif]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Account & Bucket info */}
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8a7248] to-[#ac8f5c] text-white flex items-center justify-center font-bold text-2xl shadow-xs border border-[#B09147]/40 flex-shrink-0 font-['STIX_Two_Text',serif]">
              B
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-[#1f2124] text-base font-['STIX_Two_Text',serif]">
                  Backblaze B2 Cloud Storage
                </span>

                {status.isLiveConnected ? (
                  <span className="inline-flex items-center gap-1 bg-[#005d3b] text-white text-xs font-semibold px-2.5 py-0.5 rounded-full border border-[#005d3b]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#f3e8ce]" />
                    B2 Live S3 Conectado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-[#f3e8ce] text-[#005d3b] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#B09147]/50">
                    <Database className="w-3.5 h-3.5 text-[#B09147]" />
                    {selectedBucket}
                  </span>
                )}

                <span className="inline-flex items-center gap-1 bg-[#fbfaf8] text-[#333333] text-xs font-semibold px-2.5 py-0.5 rounded-md border border-[#e2ded4]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#005d3b]" />
                  keyName: {status.keyName}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#666666] mt-1 font-medium">
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-[#8c8273]" />
                  {status.region} ({status.endpoint})
                </span>
                <span>·</span>
                <span>
                  ID do Bucket:{' '}
                  <strong className="font-mono text-[#005d3b] text-[11px]">{currentBucketObj?.id}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Right: Bucket Selector & Action buttons */}
          <div className="flex items-center gap-2.5 self-end lg:self-auto flex-wrap">
            {/* Single Bucket Badge */}
            <div className="flex items-center gap-1.5 bg-[#fbfaf8] border border-[#dcd7cb] rounded-xl px-3 py-1.5 shadow-2xs">
              <span className="text-xs font-bold text-[#666666]">Bucket:</span>
              <span className="font-bold text-xs text-[#005d3b] bg-[#f3e8ce] px-2 py-0.5 rounded border border-[#B09147]/40 flex items-center gap-1">
                <Database className="w-3 h-3 text-[#B09147]" />
                {selectedBucket}
              </span>
            </div>

            {/* Direct S3 Live Integrity Verification Button */}
            <button
              onClick={handleVerifyBucket}
              disabled={isVerifying}
              className="flex items-center gap-1.5 bg-[#fbfaf8] hover:bg-[#f3e8ce] text-[#005d3b] border border-[#dcd7cb] rounded-xl px-3.5 py-2 text-xs font-semibold shadow-2xs cursor-pointer transition-colors disabled:opacity-50"
              title="Auditar integridade de arquivos gravados no Backblaze B2 via API S3"
            >
              <SearchCheck className={`w-3.5 h-3.5 text-[#005d3b] ${isVerifying ? 'animate-pulse' : ''}`} />
              <span>{isVerifying ? 'Verificando...' : 'Verificar no B2'}</span>
            </button>

            <button
              onClick={() => setShowKeyGuide(true)}
              className="flex items-center gap-1.5 bg-[#fbfaf8] hover:bg-[#f2efe6] text-[#555] border border-[#dcd7cb] rounded-xl px-3.5 py-2 text-xs font-semibold shadow-2xs cursor-pointer transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#B09147]" />
              <span>Chaves B2</span>
            </button>

            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center gap-1.5 bg-[#005d3b] hover:bg-[#00472e] text-white rounded-xl px-3.5 py-2 text-xs font-semibold shadow-2xs cursor-pointer transition-colors disabled:opacity-50 border border-[#B09147]/40"
              title="Atualizar lista de itens do Backblaze B2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#f3e8ce]' : ''}`} />
              <span>Atualizar</span>
            </button>
          </div>
        </div>

        {/* Sync Guidance Banner */}
        <div className="mt-3.5 pt-3 border-t border-[#f0ece3] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-[#555555]">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#005d3b] flex-shrink-0" />
            <span>
              <strong>Tempo de sincronização no Backblaze:</strong> A gravação é <strong>imediata</strong> (S3 API).
              No console web oficial da Backblaze, clique no botão <strong>⟲ Sincronizar</strong> para recarregar os novos arquivos na aba.
            </span>
          </div>
          <button
            onClick={handleVerifyBucket}
            className="text-[#005d3b] font-bold hover:underline cursor-pointer flex-shrink-0 text-[11px]"
          >
            Confirmar arquivos no balde agora →
          </button>
        </div>

        {/* Status diagnosis banner if keys pending */}
        {!status.isLiveConnected && (
          <div className="mt-3 pt-3 border-t border-[#f0ece3] flex items-center justify-between flex-wrap gap-2 text-xs text-[#555555]">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#B09147] flex-shrink-0" />
              <span>
                {status.lastError ? (
                  <span className="text-rose-700 font-medium">Aviso Backblaze: {status.lastError}</span>
                ) : (
                  <span>
                    Os buckets <strong>JurisTVUpload</strong>, <strong>JurisTVUpload2</strong> e <strong>jctv.revistajc.com.br</strong> estão ativos.
                  </span>
                )}
              </span>
            </div>
            <button
              onClick={() => setShowKeyGuide(true)}
              className="font-bold text-[#005d3b] hover:underline cursor-pointer"
            >
              Onde pegar a keyID e applicationKey →
            </button>
          </div>
        )}
      </div>

      {/* Live Verification Modal */}
      {showVerifyModal && verifyResult && (
        <div className="fixed inset-0 bg-[#002b1b]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 font-['Montserrat',sans-serif]">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-[#e2ded4] animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#ece8df] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#005d3b] text-white flex items-center justify-center font-bold text-xs">
                  <CheckCircle2 className="w-5 h-5 text-[#f3e8ce]" />
                </div>
                <div>
                  <h3 className="font-normal text-base text-[#1f2124] font-['STIX_Two_Text',serif]">
                    Auditoria ao Vivo no Backblaze B2
                  </h3>
                  <p className="text-[11px] text-[#666666]">
                    Consulta direta à API S3 do balde <strong>{verifyResult.bucket}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowVerifyModal(false)}
                className="w-7 h-7 rounded-lg hover:bg-[#f2efe6] flex items-center justify-center text-[#777] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 overflow-y-auto flex-1 pr-1 text-xs">
              <div className="bg-[#fcfbfa] border border-[#e2ded4] rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[#666] text-[11px] block">Status de Gravação</span>
                  <span className="font-bold text-[#005d3b] text-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#005d3b]" />
                    {verifyResult.verified ? '100% Confirmado no B2' : 'Vazio ou Em Processamento'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[#666] text-[11px] block">Total de Objetos</span>
                  <span className="font-bold text-[#1f2124] text-sm">{verifyResult.totalObjects} itens</span>
                </div>
              </div>

              <div className="bg-[#f3e8ce]/40 border border-[#B09147]/30 rounded-xl p-3 text-[#444] text-[11px] leading-relaxed">
                <strong>Por que o site do Backblaze parecia desatualizado?</strong>
                <p className="mt-1 text-[#666]">
                  A API S3 do Backblaze possui <em>consistência imediata</em> (os arquivos entram no bucket na mesma hora). Porém, a página "Browse Files" do console web da Backblaze não atualiza sozinha: ela exige clicar no botão <strong>⟲ Sincronizar</strong> no topo da página.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#1f2124] mb-2 text-xs">
                  Objetos gravados no bucket ({verifyResult.files.length}):
                </h4>
                <div className="border border-[#e2ded4] rounded-xl divide-y divide-[#f0ece3] max-h-56 overflow-y-auto bg-white">
                  {verifyResult.files.map((file, idx) => (
                    <div key={idx} className="p-2.5 px-3 flex items-center justify-between hover:bg-[#fcfbfa]">
                      <div className="min-w-0 flex-1 pr-2">
                        <span className="font-mono text-xs text-[#1f2124] block truncate font-medium">
                          {file.key}
                        </span>
                        <span className="text-[10px] text-[#888]">
                          {new Date(file.lastModified).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <span className="font-mono text-xs font-bold text-[#005d3b] whitespace-nowrap">
                        {formatSize(Math.round(file.size / (1024 * 1024)) || 1)}
                      </span>
                    </div>
                  ))}
                  {verifyResult.files.length === 0 && (
                    <div className="p-4 text-center text-[#888]">Nenhum objeto encontrado neste balde.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#ece8df] flex justify-end">
              <button
                onClick={() => setShowVerifyModal(false)}
                className="bg-[#005d3b] hover:bg-[#00472e] text-white font-bold px-5 py-2.5 rounded-xl text-xs cursor-pointer border border-[#B09147]/50"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal with instructions */}
      {showKeyGuide && (
        <div className="fixed inset-0 bg-[#002b1b]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 font-['Montserrat',sans-serif]">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#e2ded4] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#ece8df] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-[#ac8f5c] text-white flex items-center justify-center font-bold text-xs font-['STIX_Two_Text',serif]">
                  B
                </div>
                <h3 className="font-normal text-base text-[#1f2124] font-['STIX_Two_Text',serif]">
                  Conexão Backblaze B2 (API S3)
                </h3>
              </div>
              <button
                onClick={() => setShowKeyGuide(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-[#555555] leading-relaxed">
              <div className="bg-[#fbfaf8] p-4 rounded-xl border border-[#e8e4db] text-[#1f2124]">
                <p className="font-bold text-[#005d3b] mb-1 font-['STIX_Two_Text',serif] text-sm">
                  Balde Único Oficial Configurado:
                </p>
                <ul className="space-y-1 text-xs text-[#555555]">
                  <li>• Balde: <strong>jctv.revistajc.com.br</strong></li>
                  <li>• ID do Balde: <code>bcbf67c067a0872ea91d0118</code></li>
                  <li>• KeyName associada: <strong>rafael</strong></li>
                  <li>• Endpoint S3: <strong>s3.us-west-002.backblazeb2.com</strong> (Região: <code>us-west-002</code>)</li>
                </ul>
              </div>

              <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3.5 text-xs text-amber-900">
                <span className="font-bold block mb-1">🗑️ Chaves que podem ser removidas dos Secrets:</span>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Como agora utilizamos exclusivamente o balde <strong>jctv.revistajc.com.br</strong>, as chaves antigas <code>B2_BUCKET_ID_1</code> e <code>B2_BUCKET_ID_2</code> <strong>já foram dispensadas e podem ser excluídas</strong> com segurança no menu Secrets do AI Studio.
                </p>
              </div>

              <div className="bg-[#f8f7f4] p-4 rounded-xl border border-[#e2ded4]">
                <h4 className="font-bold text-[#005d3b] text-xs mb-2 flex items-center gap-1.5 font-['STIX_Two_Text',serif]">
                  <ExternalLink className="w-3.5 h-3.5 text-[#B09147]" />
                  Variáveis de Conexão Mantidas:
                </h4>
                <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-[11px] space-y-1">
                  <div className="text-slate-400"># Secrets Essenciais:</div>
                  <div className="text-blue-300">B2_KEY_ID=sua_keyID</div>
                  <div className="text-emerald-400 break-all">B2_APPLICATION_KEY=sua_applicationKey</div>
                  <div className="text-slate-400 mt-2"># Opcionais (já possuem valor padrão no código):</div>
                  <div className="text-slate-300">B2_BUCKET_NAME=jctv.revistajc.com.br</div>
                  <div className="text-slate-300">B2_ENDPOINT=https://s3.us-west-002.backblazeb2.com</div>
                  <div className="text-slate-300">B2_REGION=us-west-002</div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowKeyGuide(false)}
                className="bg-[#005d3b] hover:bg-[#00472e] text-white font-bold px-5 py-2.5 rounded-xl text-xs cursor-pointer border border-[#B09147]/50"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
