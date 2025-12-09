'use client';

import { useState } from 'react';
import { TutorProfile } from '@/types/tutor.types';
import { apiClient } from '@/lib/api-client';
import axios from 'axios';

interface VideoUploadProps {
  profile: TutorProfile;
  onUpdate: () => void;
}

export function VideoUpload({ profile, onUpdate }: VideoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      setMessage({ type: 'error', text: 'Please select a valid video file' });
      return;
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      setMessage({ type: 'error', text: 'Video file must be less than 100MB' });
      return;
    }

    setSelectedFile(file);
    setMessage(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('video', selectedFile);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('accessToken');

      await axios.post(`${API_URL}/tutors/upload-video`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(progress);
        },
      });

      setMessage({ type: 'success', text: 'Video uploaded successfully!' });
      setSelectedFile(null);
      setUploadProgress(0);
      onUpdate();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to upload video',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (videoUrl: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      await apiClient.delete(`/tutors/video?url=${encodeURIComponent(videoUrl)}`);
      setMessage({ type: 'success', text: 'Video deleted successfully!' });
      onUpdate();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to delete video',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Demo Videos</h3>
        <p className="text-sm text-gray-600 mb-4">
          Upload demo videos to showcase your teaching style. Maximum file size: 100MB.
        </p>

        {/* Upload Section */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="video-upload"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Select Video File
              </label>
              <input
                type="file"
                id="video-upload"
                accept="video/*"
                onChange={handleFileSelect}
                disabled={uploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
              />
            </div>

            {selectedFile && (
              <div className="text-sm text-gray-600">
                Selected: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
              </div>
            )}

            {uploading && (
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Upload Video'}
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`mt-4 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}
      </div>

      {/* Existing Videos */}
      {profile.demoVideos && profile.demoVideos.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-gray-900 mb-3">Your Videos</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.demoVideos.map((videoUrl, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <video
                  src={videoUrl}
                  controls
                  className="w-full rounded-lg mb-3"
                  style={{ maxHeight: '200px' }}
                />
                <button
                  onClick={() => handleDelete(videoUrl)}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                >
                  Delete Video
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {(!profile.demoVideos || profile.demoVideos.length === 0) && (
        <div className="text-center py-8 text-gray-500">
          No demo videos uploaded yet. Upload your first video to showcase your teaching!
        </div>
      )}
    </div>
  );
}
