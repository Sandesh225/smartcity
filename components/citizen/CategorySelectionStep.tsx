'use client';

import { useMemo, useState } from 'react';
import { useCitizenComplaintWizard } from '@/stores/useCitizenComplaintWizard';
import type { ComplaintCategory } from '@/stores/useCitizenComplaintWizard';

type Props = {
  categories: ComplaintCategory[];
  loading: boolean;
  language: 'en' | 'np';
};

export function CategorySelectionStep({ categories, loading, language }: Props) {
  const { selectedCategory, setCategory, setStep } = useCitizenComplaintWizard();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase();
    return categories.filter((c) => {
      const en = (c.category_name || '').toLowerCase();
      const np = (c.category_name_nepali || '').toLowerCase();
      return en.includes(q) || np.includes(q);
    });
  }, [categories, search]);

  const canNext = !!selectedCategory;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">
          {language === 'en' ? 'What type of complaint?' : 'कुन प्रकारको गुनासो?'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {language === 'en'
            ? 'Select the category that best describes your issue.'
            : 'तपाईंको समस्याको सबैभन्दा अनुकूल श्रेणी छान्नुहोस्।'}
        </p>
      </div>

      {/* Search box */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
          🔍
        </div>
        <input
          type="text"
          className="form-input pl-10 w-full"
          placeholder={
            language === 'en' ? 'Search by category name…' : 'श्रेणी खोज्नुहोस्…'
          }
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
      </div>

      {/* Loading / Empty / List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-24 rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3 className="empty-state-title font-semibold">
            {search
              ? language === 'en'
                ? 'No categories found'
                : 'कुनै श्रेणी फेला परेन'
              : language === 'en'
              ? 'No categories available'
              : 'कुनै श्रेणी उपलब्ध छैन'}
          </h3>
          {search && (
            <p className="empty-state-description text-sm text-muted-foreground mt-1">
              {language === 'en'
                ? 'Try a different search term'
                : 'फरक खोज शब्द प्रयास गर्नुहोस्'}
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((c) => {
            const isSelected = selectedCategory?.id === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setCategory(c)}
                className="category-card transition-all"
                data-selected={isSelected}
              >
                <div className="flex items-start gap-3">
                  <div className="category-icon flex-shrink-0 mt-1">
                    {(c.category_name || '?').charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 text-left min-w-0">
                    <h3 className="category-name font-semibold">
                      {language === 'en'
                        ? c.category_name
                        : c.category_name_nepali || c.category_name}
                    </h3>
                    {c.description && (
                      <p className="category-description text-xs text-muted-foreground line-clamp-2 mt-1">
                        {c.description}
                      </p>
                    )}

                    <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground flex flex-wrap items-center gap-2">
                      {c.sla_hours && (
                        <span className="inline-flex items-center gap-1">
                          ⏱ {c.sla_hours}h {language === 'en' ? 'SLA' : 'SLA'}
                        </span>
                      )}
                      {c.default_priority && (
                        <span
                          className={`priority-badge priority-${c.default_priority}`}
                        >
                          {c.default_priority.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="flex-shrink-0 text-primary text-lg">✓</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        <button
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!canNext}
          onClick={() => setStep(2)}
        >
          {language === 'en' ? 'Continue →' : 'जारी राख्नुहोस् →'}
        </button>
      </div>
    </div>
  );
}
