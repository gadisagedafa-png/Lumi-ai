
import React, { useCallback, useState } from 'react';
import { Upload, FileText, Check, AlertCircle, X, Cloud, Image, FileType } from 'lucide-react';

interface DocumentUploadProps {
  onUpload: (file: File) => Promise<void>;
  onClose: () => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUpload, onClose }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
      'text/plain',
      'text/markdown',
      'text/csv',
      'text/html',
      'text/xml',
      'text/rtf',
      'application/rtf',
      'application/json',
      'text/javascript',
      'application/javascript',
      'text/x-python',
      'application/x-python',
      'text/css',
      'image/png',
      'image/jpeg',
      'image/webp',
      'image/heic'
    ];

    const allowedExtensions = ['.md', '.py', '.js', '.ts', '.tsx', '.jsx', '.json', '.xml', '.csv', '.html', '.css', '.txt', '.pdf', '.docx', '.pptx', '.png', '.jpg', '.jpeg', '.webp'];
    
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    const isTypeAllowed = allowedTypes.includes(file.type) || allowedExtensions.includes(fileExt);

    if (!isTypeAllowed) {
      setError('Oops! Supported formats: PDF, DOCX, PPTX, Text, Code, Images.');
      return;
    }
    
    // 20MB limit
    if (file.size > 20 * 1024 * 1024) {
      setError('Whoa! That file is too big (Max 20MB).');
      return;
    }
    setError(null);
    setFile(file);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setUploading(true);
    try {
      await onUpload(file);
      onClose();
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Try again?');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/20 backdrop-blur-md">
      <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden relative border border-white/50 animate-float-delayed">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-gray-800 mb-2">Feed Lumi</h2>
            <p className="text-gray-500 font-medium">Upload your study material.</p>
          </div>

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              relative border-4 border-dashed rounded-3xl p-10 text-center transition-all duration-300
              ${isDragging 
                ? 'border-rose-400 bg-rose-50 scale-105' 
                : file 
                  ? 'border-green-400 bg-green-50 shadow-[0_0_20px_rgba(74,222,128,0.2)]' 
                  : 'border-gray-200 hover:border-rose-300 hover:bg-white'}
            `}
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.md,.csv,.html,.xml,.json,.docx,.pptx,.rtf,.js,.py,.css"
              onChange={handleChange}
            />

            {file ? (
              <div className="flex flex-col items-center animate-happy-bounce">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-500 shadow-sm relative">
                  <Check size={40} strokeWidth={3} />
                  {/* Subtle particle effect decoration */}
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                </div>
                <p className="font-bold text-gray-800 text-lg truncate max-w-xs">{file.name}</p>
                <p className="text-sm font-bold text-green-600 mt-1">Ready to go!</p>
                <button 
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="text-xs font-bold text-gray-400 mt-4 hover:text-red-500 transition-colors"
                >
                  Change file
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 text-blue-400 shadow-inner relative">
                  <Cloud size={48} strokeWidth={2.5} />
                  <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-full shadow-sm">
                     <Image size={16} className="text-purple-400" />
                  </div>
                  <div className="absolute -top-2 -left-2 bg-white p-1.5 rounded-full shadow-sm">
                     <FileType size={16} className="text-orange-400" />
                  </div>
                </div>
                <p className="font-bold text-gray-800 text-lg">Drag & Drop</p>
                <p className="text-sm font-bold text-gray-400 mt-1 mb-6">PDF, DOCX, PPTX, Text, Images</p>
                <label 
                  htmlFor="file-upload" 
                  className="px-6 py-3 bg-white border-2 border-gray-200 rounded-xl font-bold text-gray-600 hover:border-blue-400 hover:text-blue-500 cursor-pointer transition-all shadow-sm"
                >
                  Choose File
                </label>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-600 font-bold text-sm rounded-2xl flex items-center gap-3 animate-pulse">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          <div className="mt-8">
            <button
              onClick={handleSubmit}
              disabled={!file || uploading}
              className="w-full py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl shadow-xl shadow-gray-200 transition-all font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {uploading ? (
                <>
                  <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                'Upload & Shine'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;
