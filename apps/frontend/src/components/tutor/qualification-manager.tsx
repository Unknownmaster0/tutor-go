'use client';

import { useState } from 'react';
import { TutorProfile } from '@/types/tutor.types';

interface QualificationManagerProps {
  profile: TutorProfile;
  onUpdate: (profile: Partial<TutorProfile>) => Promise<{ success: boolean; error?: string }>;
}

export function QualificationManager({ profile, onUpdate }: QualificationManagerProps) {
  const [qualifications, setQualifications] = useState<string[]>(profile.qualifications || []);
  const [newQualification, setNewQualification] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleAddQualification = () => {
    if (!newQualification.trim()) {
      setMessage({ type: 'error', text: 'Please enter a qualification' });
      return;
    }

    if (qualifications.some((q) => q.toLowerCase() === newQualification.toLowerCase())) {
      setMessage({ type: 'error', text: 'This qualification is already added' });
      return;
    }

    setQualifications([...qualifications, newQualification.trim()]);
    setNewQualification('');
    setMessage(null);
  };

  const handleRemoveQualification = (index: number) => {
    setQualifications(qualifications.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (qualifications.length === 0) {
      setMessage({ type: 'error', text: 'Please add at least one qualification' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const result = await onUpdate({ qualifications });

    setLoading(false);

    if (result.success) {
      setMessage({ type: 'success', text: 'Qualifications updated successfully!' });
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to update qualifications' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Qualifications</h3>
        <p className="text-sm text-gray-600 mb-4">
          Add your educational qualifications, certifications, and teaching credentials.
        </p>

        {/* Add New Qualification */}
        <div className="border border-gray-200 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Add New Qualification</h4>
          <div className="flex gap-3">
            <input
              type="text"
              value={newQualification}
              onChange={(e) => setNewQualification(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddQualification()}
              placeholder="e.g., Bachelor's in Mathematics, TEFL Certified"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleAddQualification}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap"
            >
              Add
            </button>
          </div>
        </div>

        {/* Qualification List */}
        {qualifications.length > 0 ? (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Your Qualifications</h4>
            {qualifications.map((qualification, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-900">{qualification}</span>
                </div>
                <button
                  onClick={() => handleRemoveQualification(index)}
                  className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg">
            No qualifications added yet. Add your first qualification above.
          </div>
        )}
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
