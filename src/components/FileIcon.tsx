import React from 'react';
import { Folder, Film, Image as ImageIcon, FileText, Archive, Music, File } from 'lucide-react';
import { FileType } from '../types';

interface FileIconProps {
  type: FileType;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const FileIcon: React.FC<FileIconProps> = ({ type, className = '', size = 'md' }) => {
  const getIcon = () => {
    switch (type) {
      case 'folder':
        return <Folder className="text-amber-500 fill-amber-100" />;
      case 'video':
        return <Film className="text-blue-500" />;
      case 'image':
        return <ImageIcon className="text-emerald-500" />;
      case 'pdf':
        return <FileText className="text-rose-500" />;
      case 'zip':
        return <Archive className="text-purple-500" />;
      case 'audio':
        return <Music className="text-violet-500" />;
      case 'document':
        return <File className="text-slate-500" />;
      default:
        return <FileText className="text-slate-500" />;
    }
  };

  const sizeClasses = {
    sm: 'w-6 h-6 p-1 text-xs',
    md: 'w-8 h-8 p-1.5 text-base',
    lg: 'w-10 h-10 p-2 text-xl',
    xl: 'w-24 h-24 p-6 text-4xl',
  };

  return (
    <div
      className={`inline-flex items-center justify-center rounded-lg bg-[#eef3fa] flex-shrink-0 ${sizeClasses[size]} ${className}`}
    >
      {getIcon()}
    </div>
  );
};
