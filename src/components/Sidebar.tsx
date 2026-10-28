import React from 'react';
import { PageId } from '../types';
import jcLogo from '../assets/logo-colorido-Justica-e-Cidadania.webp';

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const navItems: { labelSection?: string; items: { id: PageId; glyph: string; title: string }[] }[] = [
    {
      labelSection: 'GERENCIAMENTO',
      items: [
        { id: 'dashboard', glyph: '◫', title: 'Visão geral' },
        { id: 'all', glyph: '▤', title: 'Todos os arquivos' },
      ],
    },
    {
      labelSection: 'ARMAZENAMENTO',
      items: [
        { id: 'azure', glyph: '▦', title: 'Microsoft Azure' },
        { id: 'backblaze', glyph: '◈', title: 'Backblaze B2' },
      ],
    },
    {
      labelSection: 'FERRAMENTAS',
      items: [
        { id: 'transfer', glyph: '⇄', title: 'Transferir arquivos' },
        { id: 'activity', glyph: '◷', title: 'Atividades' },
      ],
    },
  ];

  return (
    <aside className="bg-white border-r border-[#e2ded4] w-[70px] sm:w-[210px] lg:w-[250px] flex-shrink-0 p-4 sm:p-5 lg:p-6 flex flex-col min-h-screen font-['Montserrat',sans-serif]">
      {/* Brand logo in Editora JC / Revista JC style */}
      <div className="hidden sm:flex flex-col items-start px-2 pb-6 border-b border-[#ece8df]">
        <img
          src={jcLogo}
          alt="Justiça & Cidadania"
          className="h-10 w-auto max-w-full object-contain"
        />
        <div className="text-[10px] font-bold text-[#B09147] tracking-[1.5px] uppercase mt-2 font-['Montserrat',sans-serif]">
          Editora JC · CloudBridge
        </div>
      </div>

      <div className="sm:hidden flex justify-center pb-5 border-b border-[#ece8df]">
        <img
          src={jcLogo}
          alt="JC"
          className="h-7 w-auto object-contain"
        />
      </div>

      <nav className="flex-1 space-y-5 pt-5">
        {navItems.map((group, gIdx) => (
          <div key={gIdx}>
            {group.labelSection && (
              <div className="hidden sm:block text-[10px] tracking-[1.5px] text-[#005d3b] font-bold px-3 mb-2 uppercase font-['Montserrat',sans-serif]">
                {group.labelSection}
              </div>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#005d3b] text-white shadow-xs font-bold'
                        : 'text-[#4a5568] hover:bg-[#f6f4ee] hover:text-[#005d3b]'
                    }`}
                    title={item.title}
                  >
                    <span className={`text-sm leading-none ${isActive ? 'text-[#f3e8ce]' : 'text-[#8c8273]'}`}>
                      {item.glyph}
                    </span>
                    <span className="hidden sm:inline">{item.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Note box */}
      <div className="hidden sm:block mt-auto bg-[#fbfaf8] text-[#4a5568] p-3.5 rounded-xl text-xs leading-relaxed border border-[#e8e4db]">
        <div className="flex items-center gap-1.5 text-[#005d3b] font-bold text-[11px] mb-1 font-['STIX_Two_Text',serif]">
          <span className="w-2 h-2 rounded-full bg-[#005d3b] inline-block" />
          <span>Editora JC Cloud</span>
        </div>
        <p className="text-[#666666] text-[11px]">
          Repositório central de arquivos e acervo editorial.
        </p>
      </div>
    </aside>
  );
};
