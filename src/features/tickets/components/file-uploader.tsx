'use client';

import { useDropzone } from 'react-dropzone';
import { useUploadDocument } from '../hooks/use-tickets';
import { Upload, File as FileIcon, Loader2 } from 'lucide-react';

interface FileUploaderProps {
  ticketId: string;
}

export const FileUploader = ({ ticketId }: FileUploaderProps) => {
  const uploadMutation = useUploadDocument(ticketId);

  const onDrop = (acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      uploadMutation.mutate(file);
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className={`p-6 border-2 border-dashed rounded-xl transition-all cursor-pointer text-center ${
        isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-2">
        {uploadMutation.isPending ? (
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        ) : (
          <Upload className={`h-8 w-8 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
        )}
        <p className="text-sm text-gray-600">
          {isDragActive ? 'Suelta los archivos aquí' : 'Arrastra archivos o haz clic para subir'}
        </p>
        <p className="text-xs text-gray-400">PDF, Imágenes, Documentos</p>
      </div>
    </div>
  );
};
