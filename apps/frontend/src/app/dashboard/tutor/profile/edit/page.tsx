'use client';

import { TutorProfileForm } from '@/components/tutor/TutorProfileForm';
import { VideoUploadComponent } from '@/components/tutor/VideoUpload';
import { AvailabilitySchedule } from '@/components/tutor/AvailabilitySchedule';
import { ProfileCompletionTracker } from '@/components/tutor/ProfileCompletionTracker';
import { useAuthContext } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useState, useEffect } from 'react';

interface TimeSlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const initializeSchedule = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      slots.push({
        dayOfWeek: day,
        startTime: `${String(hour).padStart(2, '0')}:00`,
        endTime: `${String(hour + 1).padStart(2, '0')}:00`,
        isAvailable: false,
      });
    }
  }
  return slots;
};

export default function TutorProfileSetupPage() {
  const { user } = useAuthContext();
  const [schedule, setSchedule] = useState<TimeSlot[]>(initializeSchedule());
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'basic' | 'video' | 'availability'>('basic');

  const completionSteps = [
    {
      step: 'basic',
      title: 'Basic Profile',
      description: 'Add your bio, expertise, and location',
      completed: true,
      icon: '👤',
    },
    {
      step: 'video',
      title: 'Intro Video',
      description: 'Upload a short introduction video',
      completed: !!videoUrl,
      icon: '🎬',
    },
    {
      step: 'availability',
      title: 'Availability',
      description: 'Set your teaching hours',
      completed: schedule.some((s) => s.isAvailable),
      icon: '📅',
    },
  ];

  const completionPercentage = Math.round(
    (completionSteps.filter((s) => s.completed).length / completionSteps.length) * 100,
  );

  const handleVideoUploadComplete = (url: string) => {
    setVideoUrl(url);
    setCurrentStep('availability');
  };

  return (
    <ProtectedRoute requiredRole="tutor">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900">Complete Your Profile</h1>
            <p className="text-gray-600 mt-2">
              Get discovered by students looking for tutoring help
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-8">
              {currentStep === 'basic' && <TutorProfileForm />}

              {currentStep === 'video' && (
                <div className="space-y-8">
                  <VideoUploadComponent onUploadComplete={handleVideoUploadComplete} />
                  <button
                    type="button"
                    onClick={() => setCurrentStep('basic')}
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    ← Back to Profile
                  </button>
                </div>
              )}

              {currentStep === 'availability' && (
                <div className="space-y-8">
                  <AvailabilitySchedule schedule={schedule} onScheduleChange={setSchedule} />
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep('video')}
                      className="text-green-600 hover:text-green-700 font-medium"
                    >
                      ← Back to Video
                    </button>
                    <button
                      type="button"
                      className="ml-auto px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
                    >
                      Save Schedule
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - Completion Tracker */}
            <div className="lg:col-span-1">
              <ProfileCompletionTracker
                steps={completionSteps}
                completionPercentage={completionPercentage}
              />

              {/* Navigation */}
              <div className="mt-6 bg-white rounded-lg shadow p-6 space-y-3">
                <h4 className="font-semibold text-gray-900">Navigation</h4>
                {['basic', 'video', 'availability'].map((step, index) => (
                  <button
                    key={step}
                    onClick={() => setCurrentStep(step as 'basic' | 'video' | 'availability')}
                    className={`w-full text-left px-4 py-2 rounded-lg transition ${
                      currentStep === step
                        ? 'bg-green-100 text-green-900 font-medium'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {completionSteps[index].title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
