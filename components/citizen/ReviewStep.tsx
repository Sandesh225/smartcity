'use client';

import { useCitizenComplaintWizard } from '@/stores/useCitizenComplaintWizard';

type Props = {
  onSubmit: () => void;
  submitting: boolean;
  language: 'en' | 'np';
};

export function ReviewStep({ onSubmit, submitting, language }: Props) {
  const {
    selectedCategory,
    title,
    description,
    locationAddress,
    locationLandmark,
    wardLabel,
    attachments,
    setStep,
  } = useCitizenComplaintWizard();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">
          {language === 'en'
            ? 'Review your complaint'
            : 'आफ्नो गुनासो समीक्षा गर्नुहोस्'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {language === 'en'
            ? 'Please verify all information before submitting.'
            : 'जमा गर्नु अगि सबै जानकारी जाँच गर्नुहोस्।'}
        </p>
      </div>

      <div className="space-y-4">
        {/* Category */}
        <div className="p-4 rounded-lg border border-border bg-card/50">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            {language === 'en' ? 'Category' : 'श्रेणी'}
          </div>
          {selectedCategory ? (
            <div>
              <div className="font-semibold mb-2">
                {language === 'en'
                  ? selectedCategory.category_name
                  : selectedCategory.category_name_nepali ||
                    selectedCategory.category_name}
              </div>
              <div className="flex items-center gap-2">
                {selectedCategory.default_priority && (
                  <span
                    className={`priority-badge priority-${selectedCategory.default_priority}`}
                  >
                    {selectedCategory.default_priority.toUpperCase()}
                  </span>
                )}
                {selectedCategory.sla_hours && (
                  <span className="text-xs text-muted-foreground">
                    ⏱ {selectedCategory.sla_hours}h SLA
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground text-sm">
              {language === 'en'
                ? 'No category selected'
                : 'कुनै श्रेणी छनोट गरिएको छैन'}
            </div>
          )}
        </div>

        {/* Complaint details */}
        <div className="p-4 rounded-lg border border-border bg-card/50">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            {language === 'en' ? 'Complaint Details' : 'गुनासो विवरण'}
          </div>
          <h3 className="font-semibold mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {description}
          </p>
        </div>

        {/* Location */}
        <div className="p-4 rounded-lg border border-border bg-card/50">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            {language === 'en' ? 'Location' : 'स्थान'}
          </div>
          <div className="space-y-1 text-sm">
            <div className="font-semibold">{locationAddress}</div>
            {locationLandmark && (
              <div className="text-muted-foreground">📍 {locationLandmark}</div>
            )}
            {wardLabel && (
              <div className="text-muted-foreground">📌 {wardLabel}</div>
            )}
          </div>
        </div>

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
              {language === 'en'
                ? 'Attachments'
                : 'संलग्नकहरू'}{' '}
              ({attachments.length})
            </div>
            <div className="grid grid-cols-2 gap-2">
              {attachments.map((a) => (
                <div key={a.id} className="relative group">
                  {a.file.type.startsWith('image/') ? (
                    <img
                      src={a.previewUrl || '/placeholder.svg'}
                      alt={a.file.name}
                      className="w-full h-16 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-16 bg-muted rounded-lg flex items-center justify-center text-2xl">
                      📄
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1 truncate">
                    {a.file.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          className="btn-secondary flex-1"
          onClick={() => setStep(2)}
          disabled={submitting}
        >
          {language === 'en' ? '← Edit' : '← सम्पादन गर्नुहोस्'}
        </button>
        <button
          className="btn-primary flex-1"
          onClick={onSubmit}
          disabled={submitting}
        >
          {submitting
            ? language === 'en'
              ? 'Submitting…'
              : 'जमा गरिरहेको छ…'
            : language === 'en'
            ? 'Submit Complaint'
            : 'गुनासो जमा गर्नुहोस्'}
        </button>
      </div>
    </div>
  );
}
