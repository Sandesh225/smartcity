'use client';

import { useCitizenComplaintWizard } from '@/stores/useCitizenComplaintWizard';

type Props = {
  language: 'en' | 'np';
};

export function SuccessStep({ language }: Props) {
  const { setStep } = useCitizenComplaintWizard();

  return (
    <div className="space-y-6 text-center py-6">
      <div className="success-checkmark mx-auto">
        <svg
          width="32"
          height="32"
          viewBox="0 0 48 48"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M8 24L18 34L40 12" />
        </svg>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">
          {language === 'en'
            ? 'Complaint Submitted Successfully!'
            : 'गुनासो सफलतापूर्वक जमा भयो!'}
        </h2>

        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          {language === 'en'
            ? 'We have received your complaint. You will receive updates as it is processed by your ward or department.'
            : 'तपाईंको गुनासो प्राप्त भइसकेको छ। वार्ड वा विभागले प्रक्रिया गरेपछी आपलाई सूचना पठाइनेछ।'}
        </p>
      </div>

      <div className="p-4 rounded-lg border border-border bg-card/50 max-w-md mx-auto text-left">
        <h3 className="font-semibold mb-3">
          {language === 'en' ? '✓ What happens next?' : '✓ अब के हुन्छ?'}
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <span className="text-primary flex-shrink-0">•</span>
            <span>
              {language === 'en'
                ? 'Your complaint has been assigned a tracking ID'
                : 'तपाईंको गुनासोलाई ट्र्याकिङ आईडी दिइएको छ'}
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary flex-shrink-0">•</span>
            <span>
              {language === 'en'
                ? 'You will receive notifications as the status changes'
                : 'अवस्था परिवर्तन हुँदा आपलाई सूचना पठाइनेछ'}
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary flex-shrink-0">•</span>
            <span>
              {language === 'en'
                ? 'Check your complaints list to track progress'
                : 'प्रगति ट्र्याक गर्न आफ्नो गुनासो सूची जाँच गर्नुहोस्'}
            </span>
          </li>
        </ul>
      </div>

      <button
        className="btn-primary w-full max-w-md"
        onClick={() => setStep(1)}
      >
        {language === 'en'
          ? '+ Submit Another Complaint'
          : '+ अर्को गुनासो जमा गर्नुहोस्'}
      </button>
    </div>
  );
}
