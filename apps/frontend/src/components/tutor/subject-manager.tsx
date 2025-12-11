'use client';

import { useState } from 'react';
import { TutorProfile, Subject } from '@/types/tutor.types';

interface SubjectManagerProps {
  profile: TutorProfile;
  onUpdate: (profile: Partial<TutorProfile>) => Promise<{ success: boolean; error?: string }>;
}

export function SubjectManager({ profile, onUpdate }: SubjectManagerProps) {
  const [subjects, setSubjects] = useState<Subject[]>(profile.subjects || []);
  const [newSubject, setNewSubject] = useState<{
    name: string;
    proficiency: 'beginner' | 'intermediate' | 'expert';
  }>({ name: '', proficiency: 'intermediate' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleAddSubject = () => {
    if (!newSubject.name.trim()) {
      setMessage({ type: 'error', text: 'Please enter a subject name' });
      return;
    }

    if (subjects.some((s) => s.name.toLowerCase() === newSubject.name.toLowerCase())) {
      setMessage({ type: 'error', text: 'This subject is already added' });
      return;
    }

    setSubjects([...subjects, { ...newSubject }]);
    setNewSubject({ name: '', proficiency: 'intermediate' });
    setMessage(null);
  };

  const handleRemoveSubject = (index: number) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (subjects.length === 0) {
      setMessage({ type: 'error', text: 'Please add at least one subject' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const result = await onUpdate({ subjects });

    setLoading(false);

    if (result.success) {
      setMessage({ type: 'success', text: 'Subjects updated successfully!' });
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to update subjects' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Subjects You Teach</h3>
        <p className="text-sm text-gray-600 mb-4">
          Add the subjects you teach and your proficiency level in each.
        </p>

        {/* Add New Subject */}
        <div className="border border-gray-200 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Add New Subject</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label
                htmlFor="subject-name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Subject Name
              </label>
              <input
                type="text"
                id="subject-name"
                value={newSubject.name}
                onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                placeholder="e.g., Mathematics, Physics, English"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="proficiency" className="block text-sm font-medium text-gray-700 mb-1">
                Proficiency
              </label>
              <select
                id="proficiency"
                value={newSubject.proficiency}
                onChange={(e) =>
                  setNewSubject({
                    ...newSubject,
                    proficiency: e.target.value as 'beginner' | 'intermediate' | 'expert',
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleAddSubject}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            Add Subject
          </button>
        </div>

        {/* Subject List */}
        {subjects.length > 0 ? (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Your Subjects</h4>
            {subjects.map((subject, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <span className="font-medium text-gray-900">{subject.name}</span>
                  <span className="ml-3 text-sm text-gray-600">
                    {subject.proficiency.charAt(0).toUpperCase() + subject.proficiency.slice(1)}
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveSubject(index)}
                  className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg">
            No subjects added yet. Add your first subject above.
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
