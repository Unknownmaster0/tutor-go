'use client';

interface CompletionStep {
  step: string;
  title: string;
  description: string;
  completed: boolean;
  icon: string;
}

interface ProfileCompletionTrackerProps {
  steps: CompletionStep[];
  completionPercentage: number;
}

export const ProfileCompletionTracker: React.FC<ProfileCompletionTrackerProps> = ({
  steps,
  completionPercentage,
}) => {
  const completedSteps = steps.filter((s) => s.completed).length;

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Profile Completion</h3>

        {/* Progress Bar */}
        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">
              {completedSteps}/{steps.length} steps completed
            </span>
            <span className="text-sm font-bold text-green-600">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-green-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={step.step}
            className={`flex items-start gap-4 p-4 rounded-lg border-2 transition ${
              step.completed ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
            }`}
          >
            {/* Icon */}
            <div
              className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full font-bold text-white ${
                step.completed ? 'bg-green-600' : 'bg-gray-400'
              }`}
            >
              {step.completed ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                index + 1
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-gray-900">{step.title}</h4>
                {step.completed && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Done
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">{step.description}</p>
            </div>

            {/* Status Icon */}
            {!step.completed && (
              <div className="flex-shrink-0">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {completionPercentage === 100 && (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
          <p className="text-green-900 font-semibold">🎉 Profile Complete!</p>
          <p className="text-sm text-green-700 mt-1">Your profile is now visible to students</p>
        </div>
      )}
    </div>
  );
};
