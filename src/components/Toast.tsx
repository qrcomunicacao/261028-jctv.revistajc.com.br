import React from 'react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed right-6 bottom-6 z-50 bg-[#003823] text-white px-5 py-3.5 rounded-xl shadow-2xl text-xs sm:text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-200 border border-[#B09147]/50 font-['Montserrat',sans-serif] flex items-center gap-2.5">
      <div className="w-5 h-5 rounded-md bg-[#B09147] text-[#003823] flex items-center justify-center font-bold text-[10px] font-['STIX_Two_Text',serif] flex-shrink-0">
        JC
      </div>
      <span>{message}</span>
    </div>
  );
};
