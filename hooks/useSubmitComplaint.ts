// hooks/useSubmitComplaint.ts
import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseClient';
import { useCitizenComplaintWizard } from '@/stores/useCitizenComplaintWizard';
import toast from 'react-hot-toast';

export function useSubmitComplaint(onAfterSubmit?: () => void) {
  const {
    selectedCategory,
    wardId,
    title,
    description,
    locationAddress,
    locationLandmark,
    latitude,
    longitude,
    attachments,
    reset,
    setStep,
  } = useCitizenComplaintWizard();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    if (!selectedCategory || !wardId) {
      toast.error('Missing complaint category or ward.');
      return;
    }
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const { data, error } = await supabaseBrowser.rpc(
        "create_citizen_complaint",
        {
          p_category_id: selectedCategory.id,
          p_ward_id: wardId,
          p_title: title.trim(),
          p_description: description.trim(),
          p_location_address: locationAddress.trim(),
          p_location_landmark: locationLandmark.trim() || null,
          p_latitude: latitude,
          p_longitude: longitude,
        }
      );

      if (error || !data || (Array.isArray(data) && data.length === 0)) {
        console.error(
          "submit error",
          error,
          (error as any)?.message,
          (error as any)?.code
        );
        toast.error("Unable to submit complaint.");
        setIsSubmitting(false);
        return;
      }

      const row = Array.isArray(data) ? data[0] : (data as any);
      const complaintId: string = row.id;
      const citizenId: string = row.citizen_id;

      let failedUploads = 0;

      for (const att of attachments) {
        const path = `${complaintId}/${Date.now()}-${att.file.name}`;

        const { data: storageData, error: storageError } =
          await supabaseBrowser.storage
            .from("complaint-files")
            .upload(path, att.file);

        if (storageError || !storageData) {
          console.error(storageError);
          failedUploads += 1;
          continue;
        }

        const { error: metaError } = await supabaseBrowser
          .from("complaint_attachments")
          .insert({
            complaint_id: complaintId,
            file_name: att.file.name,
            file_type: att.file.type,
            file_size_bytes: att.file.size,
            storage_path: storageData.path,
            uploaded_by: citizenId,
            is_public: false,
          });

        if (metaError) {
          console.error(metaError);
          failedUploads += 1;
        }
      }

      if (failedUploads > 0) {
        toast("Complaint registered, but some attachments failed.", {
          icon: "⚠️",
        });
      } else {
        toast.success("Complaint submitted successfully!");
      }

      reset();
      setStep(4);
      onAfterSubmit?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submit, isSubmitting };
}
