import { useState, useRef } from 'react';
import { Upload, X, File, Image, Video, FileText } from 'lucide-react';

interface FileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // w MB
  accept?: string;
}

const FileUpload = ({ 
  files, 
  onFilesChange, 
  maxFiles = 10, 
  maxSize = 10,
  accept = "image/jpeg,image/png,image/gif,image/bmp,image/webp,video/mp4,video/avi,video/mov,video/wmv,application/pdf,.psd"
}: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return Image;
    if (file.type.startsWith('video/')) return Video;
    if (file.type === 'application/pdf') return FileText;
    return File;
  };

  const validateFile = (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      alert(`Plik ${file.name} jest za duży. Maksymalny rozmiar to ${maxSize}MB`);
      return false;
    }
    return true;
  };

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;

    const validFiles = Array.from(newFiles).filter(validateFile);
    const currentFiles = [...files];
    
    // Remove any files that are duplicates of existing files
    const uniqueNewFiles = validFiles.filter(newFile => 
      !currentFiles.some(existingFile => 
        existingFile.name === newFile.name && 
        existingFile.size === newFile.size && 
        existingFile.lastModified === newFile.lastModified
      )
    );
    
    const totalFiles = [...currentFiles, ...uniqueNewFiles].slice(0, maxFiles);
    
    onFilesChange(totalFiles);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
          dragActive 
            ? 'border-gold bg-gold/5' 
            : 'border-border hover:border-gold/50 bg-background/40'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        
        <div className="flex flex-col items-center space-y-3">
          <div className="p-3 rounded-full bg-gold/10 border border-gold/20">
            <Upload className="w-5 h-5 text-gold" />
          </div>
          
          <div>
            <p className="text-foreground font-medium text-sm">
              Przeciągnij i upuść pliki tutaj
            </p>
            <p className="text-muted-foreground text-xs">
              lub kliknij aby wybrać
            </p>
          </div>
          
          <button
            type="button"
            onClick={openFileDialog}
            className="px-3 py-1.5 rounded-lg bg-gold text-black font-medium hover:bg-gold/90 transition-colors text-sm"
          >
            Wybierz pliki
          </button>
          
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Maksymalny rozmiar: {maxSize}MB na plik</p>
            <p>Maksymalna liczba plików: {maxFiles}</p>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            Wybrane pliki ({files.length}/{maxFiles})
          </p>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {files.map((file, index) => {
              const Icon = getFileIcon(file);
              const isImage = file.type.startsWith('image/');
              const isVideo = file.type.startsWith('video/');
              
              return (
                <div
                  key={index}
                  className="relative group border border-border rounded-lg overflow-hidden bg-background/40 hover:border-gold/50 transition-colors"
                >
                  {isImage ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-24 object-cover"
                    />
                  ) : isVideo ? (
                    <video
                      src={URL.createObjectURL(file)}
                      className="w-full h-24 object-cover"
                      muted
                    />
                  ) : (
                    <div className="w-full h-16 flex items-center justify-center bg-background/60">
                      <Icon className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  
                  <div className="p-1">
                    <p className="text-xs text-foreground truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-0.5 right-0.5 w-4 h-4 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
