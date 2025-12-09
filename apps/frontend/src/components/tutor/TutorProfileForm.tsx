'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';

interface ProfileFormData {
  bio: string;
  hourlyRate: number;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  expertise: string[];
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  serviceRadius: number;
}

const EXPERTISE_OPTIONS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'History',
  'Geography',
  'Computer Science',
  'Economics',
  'Psychology',
];

const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Beginner (0-2 years)' },
  { value: 'intermediate', label: 'Intermediate (2-5 years)' },
  { value: 'advanced', label: 'Advanced (5-10 years)' },
  { value: 'expert', label: 'Expert (10+ years)' },
];

export const TutorProfileForm: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    bio: '',
    hourlyRate: 20,
    experienceLevel: 'intermediate',
    expertise: [],
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    serviceRadius: 10,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.bio.trim()) newErrors.bio = 'Bio is required';
    if (formData.bio.length < 50) newErrors.bio = 'Bio must be at least 50 characters';
    if (formData.bio.length > 500) newErrors.bio = 'Bio must not exceed 500 characters';

    if (formData.hourlyRate < 10) newErrors.hourlyRate = 'Hourly rate must be at least $10';
    if (formData.hourlyRate > 500) newErrors.hourlyRate = 'Hourly rate must not exceed $500';

    if (formData.expertise.length === 0) newErrors.expertise = 'Select at least one expertise';
    if (formData.expertise.length > 10) newErrors.expertise = 'Select maximum 10 expertise areas';

    if (!formData.street.trim()) newErrors.street = 'Street address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State/Province is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'Zip/Postal code is required';

    if (formData.serviceRadius < 1)
      newErrors.serviceRadius = 'Service radius must be at least 1 km';
    if (formData.serviceRadius > 100)
      newErrors.serviceRadius = 'Service radius must not exceed 100 km';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    if (name === 'hourlyRate' || name === 'serviceRadius') {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleExpertiseToggle = (expertise: string) => {
    setFormData((prev) => ({
      ...prev,
      expertise: prev.expertise.includes(expertise)
        ? prev.expertise.filter((e) => e !== expertise)
        : [...prev.expertise, expertise],
    }));

    if (errors.expertise) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated.expertise;
        return updated;
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix form errors');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/tutors/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          bio: formData.bio,
          hourlyRate: formData.hourlyRate,
          experienceLevel: formData.experienceLevel,
          subjects: formData.expertise,
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            country: formData.country,
            zipCode: formData.zipCode,
          },
          serviceRadius: formData.serviceRadius,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create profile');
      }

      toast.success('Profile created successfully!');
      router.push('/dashboard/tutor/profile');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Complete Your Tutor Profile</h2>
        <p className="text-gray-600 mt-2">Help students find the perfect tutor</p>
      </div>

      {/* Bio Section */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">About You</h3>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
            Professional Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            placeholder="Tell students about your teaching experience and approach..."
            className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition ${
              errors.bio ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          <div className="flex justify-between mt-1">
            {errors.bio && <p className="text-sm text-red-600">{errors.bio}</p>}
            <p className="text-xs text-gray-500 ml-auto">{formData.bio.length}/500</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700">
              Hourly Rate (USD)
            </label>
            <input
              type="number"
              id="hourlyRate"
              name="hourlyRate"
              value={formData.hourlyRate}
              onChange={handleChange}
              min="10"
              max="500"
              step="5"
              className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition ${
                errors.hourlyRate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.hourlyRate && <p className="text-sm text-red-600 mt-1">{errors.hourlyRate}</p>}
          </div>

          <div>
            <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700">
              Experience Level
            </label>
            <select
              id="experienceLevel"
              name="experienceLevel"
              value={formData.experienceLevel}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
            >
              {EXPERIENCE_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Expertise Section */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Areas of Expertise</h3>
        <p className="text-sm text-gray-600">Select all subjects you can teach</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {EXPERTISE_OPTIONS.map((expertise) => (
            <button
              key={expertise}
              type="button"
              onClick={() => handleExpertiseToggle(expertise)}
              className={`p-3 rounded-lg border-2 transition font-medium ${
                formData.expertise.includes(expertise)
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              {expertise}
            </button>
          ))}
        </div>
        {errors.expertise && <p className="text-sm text-red-600">{errors.expertise}</p>}
      </div>

      {/* Address Section */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Location</h3>

        <div>
          <label htmlFor="street" className="block text-sm font-medium text-gray-700">
            Street Address
          </label>
          <input
            type="text"
            id="street"
            name="street"
            value={formData.street}
            onChange={handleChange}
            placeholder="123 Main Street"
            className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition ${
              errors.street ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.street && <p className="text-sm text-red-600 mt-1">{errors.street}</p>}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              City
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="New York"
              className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition ${
                errors.city ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.city && <p className="text-sm text-red-600 mt-1">{errors.city}</p>}
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700">
              State/Province
            </label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="NY"
              className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition ${
                errors.state ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.state && <p className="text-sm text-red-600 mt-1">{errors.state}</p>}
          </div>

          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700">
              Country
            </label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="United States"
              className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition ${
                errors.country ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.country && <p className="text-sm text-red-600 mt-1">{errors.country}</p>}
          </div>

          <div>
            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
              Zip/Postal Code
            </label>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              placeholder="10001"
              className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition ${
                errors.zipCode ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.zipCode && <p className="text-sm text-red-600 mt-1">{errors.zipCode}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="serviceRadius" className="block text-sm font-medium text-gray-700">
            Service Radius (km)
          </label>
          <input
            type="number"
            id="serviceRadius"
            name="serviceRadius"
            value={formData.serviceRadius}
            onChange={handleChange}
            min="1"
            max="100"
            step="1"
            className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition ${
              errors.serviceRadius ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          <p className="text-xs text-gray-500 mt-1">
            How far are you willing to travel for sessions?
          </p>
          {errors.serviceRadius && (
            <p className="text-sm text-red-600 mt-1">{errors.serviceRadius}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {isLoading ? 'Creating Profile...' : 'Create Profile'}
      </button>
    </form>
  );
};
