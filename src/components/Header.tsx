import React from 'react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onLogout: () => void;
  userEmail?: string;
}

export const Header: React.FC<HeaderProps> = ({ searchQuery, onSearchChange, onLogout, userEmail = 'atendimento@qrcomunicacao.com.br' }) => {
  const getInitialsAndOrg = (email: string) => {
    if (email.endsWith('@editorajc.com.br')) {
      return { initials: 'JC', org: 'Editora JC' };
    }
    if (email.endsWith('@institutojc.com.br')) {
      return { initials: 'JC', org: 'Instituto JC' };
    }
    if (email.endsWith('@qrcomunicacao.com.br')) {
      return { initials: 'QR', org: 'QR Comunicação' };
    }
    const namePart = email.split('@')[0] || 'U';
    return { initials: namePart.slice(0, 2).toUpperCase(), org: 'Usuário Autorizado' };
  };

  const { initials, org } = getInitialsAndOrg(userEmail);

  return (
    <header className="h-[74px] bg-white border-b border-[#e2ded4] flex items-center gap-4 px-4 sm:px-8 font-['Montserrat',sans-serif]">
      {/* Search Input */}
      <div className="relative flex-1 max-w-[550px]">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="⌕ Pesquisar arquivos, matérias, edições e pastas..."
          className="w-full h-[41px] bg-[#f7f6f1] border border-[#e2ded4] rounded-xl px-4 text-xs font-medium text-[#1f2124] placeholder-[#8c8273] focus:border-[#005d3b] focus:bg-white focus:outline-none transition-all"
        />
      </div>

      {/* User Avatar & Info */}
      <div className="ml-auto flex items-center gap-3">
        <div className="hidden md:flex flex-col text-right">
          <span className="text-xs font-bold text-[#1f2124] truncate max-w-[220px]" title={userEmail}>
            {userEmail}
          </span>
          <span className="text-[10px] font-semibold text-[#005d3b] tracking-wide">
            {org}
          </span>
        </div>

        <div
          className="w-10 h-10 rounded-xl bg-[#005d3b] text-[#B09147] flex items-center justify-center font-bold text-xs select-none border border-[#B09147]/40 shadow-xs font-['STIX_Two_Text',serif]"
          title={`${org} (${userEmail})`}
        >
          {initials}
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          type="button"
          className="bg-[#fbfaf8] hover:bg-[#f2efe6] border border-[#dcd7cb] rounded-xl px-3.5 py-2 text-xs font-semibold text-[#4a5568] transition-all cursor-pointer shadow-2xs hover:text-[#005d3b]"
        >
          Sair
        </button>
      </div>
    </header>
  );
};
