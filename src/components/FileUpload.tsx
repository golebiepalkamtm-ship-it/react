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

  const resizeImage = async (file: File, targetMax: number, mime: string, quality: number): Promise<File> => {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = dataUrl;
    });
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    const maxSide = Math.max(w, h);
    const scale = maxSide > targetMax ? targetMax / maxSide : 1;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, mime, quality));
    if (!blob) return file;
    const nameBase = file.name.replace(/\.[^/.]+$/, '');
    const ext = mime === 'image/webp' ? 'webp' : 'jpg';
    const newFile = new File([blob], `${nameBase}.${ext}`, { type: mime, lastModified: Date.now() });
    return newFile;
  };

  const handleFiles = async (newFiles: FileList | null) => {
    if (!newFiles) return;

    const pickedFiles = Array.from(newFiles);
    const processedFiles: File[] = [];
    for (const f of pickedFiles) {
      if (!validateFile(f)) continue;
      if (f.type.startsWith('image/') && f.type !== 'image/gif') {
        try {
          const converted = await resizeImage(f, 1600, 'image/webp', 0.82);
          processedFiles.push(converted);
        } catch {
          processedFiles.push(f);
        }
      } else {
        processedFiles.push(f);
      }
    }
    const currentFiles = [...files];
    
    // Remove any files that are duplicates of existing files
    const uniqueNewFiles = processedFiles.filter(newFile => 
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
      <div className="relative border-2 border-dashed rounded-xl p-6 text-center border-border hover:border-gold/50 bg-background/40 transition-all">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        
        <button
          type="button"
          onClick={openFileDialog}
          className="px-4 py-2 rounded-lg bg-gold text-black font-medium hover:bg-gold/90 transition-colors text-sm"
        >
          Wybierz pliki
        </button>
        
        <div className="text-xs text-muted-foreground mt-2">
          <p>Maksymalny rozmiar: {maxSize}MB na plik</p>
          <p>Maksymalna liczba plików: {maxFiles}</p>
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
                      className="w-full h-16 object-cover"
                    />
                  ) : isVideo ? (
                    <video
                      src={URL.createObjectURL(file)}
                      className="w-full h-16 object-cover"
                      muted
                    />
                  ) : (
                    <div className="w-full h-16 flex items-center justify-center bg-background/60">
                      <Icon className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  
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
