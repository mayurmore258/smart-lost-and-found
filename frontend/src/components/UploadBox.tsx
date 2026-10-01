import React, { useRef, useState } from 'react';

interface UploadBoxProps {
  onImageSelected: (file: File | null) => void;
  label?: string;
  hint?: string;
}

export const UploadBox: React.FC<UploadBoxProps> = ({
  onImageSelected,
  label = 'Upload Photo of Belonging',
  hint = 'Supports PNG, JPG, WEBP up to 10MB',
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    onImageSelected(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageSelected(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="block text-sm font-semibold text-gray-900 dark:text-[#f0f2f0]">
        {label}
      </label>

      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative min-h-[220px] rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center p-6 text-center ${
          isDragging
            ? 'border-[#346b4f] bg-emerald-50/50 dark:bg-[#1f2d25]'
            : preview
            ? 'border-gray-300 dark:border-[#2f3330] bg-gray-50 dark:bg-[#1c1e1d]'
            : 'border-gray-300 dark:border-[#2f3330] hover:border-[#346b4f] dark:hover:border-[#3d7a5b] bg-gray-50 dark:bg-[#1c1e1d]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        {preview ? (
          <div className="relative w-full max-w-sm aspect-[4/3] rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-[#2f3330]">
            <img src={preview} alt="Selected preview" className="w-full h-full object-cover" />
            <button
              onClick={handleRemove}
              type="button"
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-colors shadow-md"
              title="Remove photo"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
            <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-sm py-1 px-3 rounded-lg text-white text-xs text-center font-medium">
              Click box to replace photo
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-[#222523] flex items-center justify-center text-[#346b4f] dark:text-[#99d3b0]">
              <span className="material-symbols-outlined text-[28px]">add_a_photo</span>
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900 dark:text-[#f0f2f0]">
                Click or drag & drop photo here
              </p>
              <p className="text-xs text-gray-500 dark:text-[#949994] mt-1">{hint}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
