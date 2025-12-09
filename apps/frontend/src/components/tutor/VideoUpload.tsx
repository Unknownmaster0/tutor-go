'use client';

import { useRef, useState } from 'react';
import toast from 'react-hot-toast';

interface VideoUploadProps {
  onUploadComplete: (videoUrl: string) => void;
  isLoading?: boolean;
}

export const VideoUploadComponent: React.FC<VideoUploadProps> = ({
  onUploadComplete,
  isLoading = false,
}) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a video file');
      return;
    }

    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast.error('Video must be smaller than 100MB');
      return;
    }

    // Validate duration (would need to check after loading)
    setVideoFile(file);
    toast.success('Video selected. Click upload to proceed.');
  };

  const handleUpload = async () => {
    if (!videoFile) {
      toast.error('Please select a video first');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('video', videoFile);

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          toast.success('Video uploaded successfully!');
          onUploadComplete(response.videoUrl);
          setVideoFile(null);
          setUploadProgress(0);
          if (fileInputRef.current) fileInputRef.current.value = '';
        } else {
          toast.error('Upload failed');
        }
      });

      xhr.addEventListener('error', () => {
        toast.error('Upload failed');
      });

      xhr.open('POST', '/tutors/upload-video');
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('accessToken')}`);
      xhr.send(formData);
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      toast.success('Video selected. Click upload to proceed.');
    } else {
      toast.error('Please drop a video file');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Upload Intro Video</h3>
      <p className="text-sm text-gray-600">
        A short video introduction helps students get to know you better (max 100MB, MP4/WebM)
      </p>

      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-400 transition cursor-pointer"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div onClick={() => fileInputRef.current?.click()} className="space-y-2">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v24a4 4 0 004 4h24a4 4 0 004-4V20m-6-8l-8 8m0 0l-8-8m8 8v16"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-sm font-medium text-gray-700">
            Drag and drop your video here or click to select
          </p>
          <p className="text-xs text-gray-500">MP4, WebM or OGV (max 100MB, 10 minutes)</p>
        </div>
      </div>

      {videoFile && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-green-900">{videoFile.name}</p>
              <p className="text-sm text-green-700">
                {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <button
              type="button"
              onClick={() => setVideoFile(null)}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Remove
            </button>
          </div>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">Uploading...</span>
                <span className="text-gray-600">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading || isLoading}
            className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {uploading ? `Uploading ${uploadProgress}%...` : 'Upload Video'}
          </button>
        </div>
      )}
    </div>
  );
};
