'use client';

import type { ChangeEvent } from 'react';
import { useCitizenComplaintWizard } from '@/stores/useCitizenComplaintWizard';
import type { Ward } from '@/hooks/useWards';
import toast from 'react-hot-toast';
import { supabaseBrowser } from '@/lib/supabaseClient';

type Props = {
  wards: Ward[];
  wardsLoading: boolean;
  language: 'en' | 'np';
};

export function DetailsFormStep({ wards, wardsLoading, language }: Props) {
  const {
    title,
    description,
    locationAddress,
    locationLandmark,
    wardLabel,
    latitude,
    longitude,
    attachments,
    maxAttachmentSizeMb,
    setTitle,
    setDescription,
    setLocationAddress,
    setLocationLandmark,
    setWard,
    setCoords,
    setAttachments,
    removeAttachment,
    setStep,
  } = useCitizenComplaintWizard();

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error(
        language === 'en'
          ? 'Location not supported. Please enter address manually.'
          : 'स्थान समर्थित छैन। कृपया ठेगाना म्यानुएली राख्नुहोस्।'
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setCoords(lat, lng);

        const { data, error } = await supabaseBrowser.rpc('match_point_to_ward', {
          lat,
          lng,
        });

        if (error || !data || data.length === 0) {
          toast.error(
            language === 'en'
              ? 'Location outside ward boundaries. Please select manually.'
              : 'वार्डको सीमा बाहिर। कृपया म्यानुएली छान्नुहोस्।'
          );
          setWard(null, '');
          return;
        }

        const row = data[0];
        setWard(
          row.ward_id,
          `${language === 'en' ? 'Ward' : 'वार्ड'} ${row.ward_number} – ${
            row.ward_name
          }`
        );
        toast.success(
          language === 'en'
            ? 'Location detected successfully!'
            : 'स्थान सफलतापूर्वक पत्ता लगाइयो!'
        );
      },
      () => {
        toast.error(
          language === 'en'
            ? 'Could not access location. Please select ward manually.'
            : 'स्थान पहुँच गर्न सकिएन। कृपया म्यानुएली छान्नुहोस्।'
        );
      }
    );
  };

  const handleFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const maxBytes = maxAttachmentSizeMb * 1024 * 1024;
    const currentCount = attachments.length;
    const remainingSlots = 5 - currentCount;

    if (remainingSlots <= 0) {
      toast.error(
        language === 'en'
          ? 'Maximum 5 files allowed.'
          : 'अधिकतम ५ फाइलहरू अनुमति दिइएका छन्।'
      );
      return;
    }

    const selected = Array.from(files).slice(0, remainingSlots);
    const invalid = selected.find((f) => f.size > maxBytes);
    if (invalid) {
      toast.error(
        language === 'en'
          ? `File too large. Maximum ${maxAttachmentSizeMb}MB.`
          : `फाइल धेरै ठूलो। अधिकतम ${maxAttachmentSizeMb}MB।`
      );
      return;
    }

    const added = selected.map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()
        .toString(36)
        .slice(2)}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setAttachments([...attachments, ...added]);
  };

  const canNext =
    title.trim() && description.trim() && locationAddress.trim() && !!wardLabel;

  const resolveWardIdFromLabel = () => {
    if (!wardLabel) return '';
    const match = wards.find((w) => {
      const label = `${language === 'en' ? 'Ward' : 'वार्ड'} ${w.ward_number} – ${
        language === 'en' ? w.ward_name : w.ward_name_nepali || w.ward_name
      }`;
      return label === wardLabel;
    });
    return match?.id ?? '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">
          {language === 'en'
            ? 'Provide complaint details'
            : 'गुनासो विवरण प्रदान गर्नुहोस्'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {language === 'en'
            ? 'Help us understand your issue better. Fields marked with * are required.'
            : 'आफ्नो समस्या बुझ्न मदद गर्नुहोस्। * चिह्न भएका क्षेत्रहरू आवश्यक छन्।'}
        </p>
      </div>

      <div className="space-y-5">
        {/* Title */}
        <div className="form-group">
          <label className="form-label">
            {language === 'en' ? 'Title' : 'शीर्षक'}
            <span className="text-destructive ml-1">*</span>
          </label>
          <input
            type="text"
            className="form-input"
            placeholder={
              language === 'en'
                ? 'e.g. Street light not working'
                : 'जस्तै: बत्ती नबलेको छ'
            }
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            aria-describedby="title-count"
          />
          <div className="form-hint" id="title-count">
            <span>{title.length}/100</span>
          </div>
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label">
            {language === 'en' ? 'Description' : 'विवरण'}
            <span className="text-destructive ml-1">*</span>
          </label>
          <textarea
            className="form-input form-textarea"
            placeholder={
              language === 'en'
                ? 'Describe the issue in detail. What happened? When did you notice it?'
                : 'समस्या विस्तारमा वर्णन गर्नुहोस्। के भयो? कहिले देख्नुभयो?'
            }
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            aria-describedby="desc-count"
          />
          <div className="form-hint" id="desc-count">
            <span>{description.length}/500</span>
          </div>
        </div>

        {/* Location address */}
        <div className="form-group">
          <label className="form-label">
            {language === 'en' ? 'Location Address' : 'स्थान ठेगाना'}
            <span className="text-destructive ml-1">*</span>
          </label>
          <input
            type="text"
            className="form-input"
            placeholder={
              language === 'en' ? 'Street or area name' : 'गली वा क्षेत्रको नाम'
            }
            value={locationAddress}
            onChange={(e) => setLocationAddress(e.target.value)}
          />
        </div>

        {/* Landmark */}
        <div className="form-group">
          <label className="form-label">
            {language === 'en' ? 'Landmark (Optional)' : 'संकेत (वैकल्पिक)'}
          </label>
          <input
            type="text"
            className="form-input"
            placeholder={
              language === 'en'
                ? 'e.g. Near Amarsingh Chowk'
                : 'जस्तै: अमरसिंह चौक नजिक'
            }
            value={locationLandmark}
            onChange={(e) => setLocationLandmark(e.target.value)}
          />
        </div>

        {/* Ward selection */}
        <div className="form-group">
          <label className="form-label">
            {language === 'en' ? 'Ward' : 'वार्ड'}
            <span className="text-destructive ml-1">*</span>
          </label>

          <button
            type="button"
            className="btn-secondary btn-small w-full mb-3"
            onClick={handleUseCurrentLocation}
          >
            📍 {language === 'en' ? 'Use GPS' : 'GPS प्रयोग गर्नुहोस्'}
          </button>

          {wardsLoading ? (
            <div className="py-3 px-4 rounded-lg bg-muted text-muted-foreground text-sm">
              {language === 'en'
                ? 'Loading wards…'
                : 'वार्डहरू लोड भइरहेको छ…'}
            </div>
          ) : (
            <select
              className="form-input"
              onChange={(e) => {
                const w = wards.find((ward) => ward.id === e.target.value);
                if (w) {
                  const label = `${language === 'en' ? 'Ward' : 'वार्ड'} ${
                    w.ward_number
                  } – ${
                    language === 'en'
                      ? w.ward_name
                      : w.ward_name_nepali || w.ward_name
                  }`;
                  setWard(w.id, label);
                } else {
                  setWard(null, '');
                }
              }}
              value={resolveWardIdFromLabel()}
            >
              <option value="">
                {language === 'en' ? '— Select ward —' : '— वार्ड छान्नुहोस् —'}
              </option>
              {wards.map((w) => (
                <option key={w.id} value={w.id}>
                  {`${language === 'en' ? 'Ward' : 'वार्ड'} ${w.ward_number} – ${
                    language === 'en'
                      ? w.ward_name
                      : w.ward_name_nepali || w.ward_name
                  }`}
                </option>
              ))}
            </select>
          )}

          {wardLabel && (
            <div className="mt-2 text-sm text-primary font-medium">
              ✓ {wardLabel}
              {latitude && longitude && (
                <span className="text-muted-foreground text-xs ml-2">
                  • {latitude.toFixed(3)}, {longitude.toFixed(3)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Attachments */}
        <div className="form-group">
          <label className="form-label">
            {language === 'en'
              ? 'Attachments (Optional)'
              : 'संलग्नकहरू (वैकल्पिक)'}
          </label>

          <label className="file-input-label cursor-pointer">
            <input
              type="file"
              multiple
              accept="image/*,application/pdf,.doc,.docx"
              onChange={handleFiles}
              className="hidden"
              disabled={attachments.length >= 5}
            />
            <span className="file-input-button block">
              📎{' '}
              {language === 'en' ? 'Choose files' : 'फाइलहरू छान्नुहोस्'}
            </span>
          </label>

          <div className="form-hint">
            <span>
              {attachments.length}/5{' '}
              {language === 'en' ? 'files • Max' : 'फाइलहरू • अधिकतम'}{' '}
              {maxAttachmentSizeMb}MB
            </span>
          </div>

          {attachments.length > 0 && (
            <div className="attachment-grid mt-4">
              {attachments.map((a) => (
                <div key={a.id} className="attachment-preview group">
                  {a.file.type.startsWith('image/') ? (
                    <img
                      src={a.previewUrl || '/placeholder.svg'}
                      alt={a.file.name}
                      className="attachment-image"
                    />
                  ) : (
                    <div className="attachment-icon">📄</div>
                  )}
                  <button
                    type="button"
                    className="attachment-remove"
                    onClick={() => removeAttachment(a.id)}
                    title={language === 'en' ? 'Remove' : 'हटाउनुहोस्'}
                  >
                    ✕
                  </button>
                  <div className="attachment-name">{a.file.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        <button className="btn-secondary flex-1" onClick={() => setStep(1)}>
          {language === 'en' ? '← Back' : '← पछाडि'}
        </button>
        <button
          className="btn-primary flex-1"
          disabled={!canNext}
          onClick={() => setStep(3)}
        >
          {language === 'en' ? 'Review →' : 'समीक्षा →'}
        </button>
      </div>
    </div>
  );
}
