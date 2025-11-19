// stores/useCitizenComplaintWizard.ts
import { create } from 'zustand';

export type WizardStep = 1 | 2 | 3 | 4;

export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

export type ComplaintCategory = {
  id: string;
  category_name: string;
  category_name_nepali: string | null;
  description: string | null;
  default_priority: PriorityLevel;
  sla_hours: number | null;
};

export type LocalAttachment = {
  id: string;
  file: File;
  previewUrl: string;
};

type WizardState = {
  step: WizardStep;
  language: 'en' | 'np';
  selectedCategory: ComplaintCategory | null;
  title: string;
  description: string;
  locationAddress: string;
  locationLandmark: string;
  wardId: string | null;
  wardLabel: string;
  latitude: number | null;
  longitude: number | null;
  attachments: LocalAttachment[];
  maxAttachmentSizeMb: number;

  setLanguage: (l: 'en' | 'np') => void;
  setStep: (s: WizardStep) => void;
  setCategory: (c: ComplaintCategory | null) => void;
  setTitle: (t: string) => void;
  setDescription: (d: string) => void;
  setLocationAddress: (v: string) => void;
  setLocationLandmark: (v: string) => void;
  setWard: (id: string | null, label: string) => void;
  setCoords: (lat: number | null, lng: number | null) => void;
  setAttachments: (atts: LocalAttachment[]) => void;
  removeAttachment: (id: string) => void;
  setMaxAttachmentSizeMb: (v: number) => void;
  reset: () => void;
};

export const useCitizenComplaintWizard = create<WizardState>((set) => ({
  step: 1,
  language: 'en',
  selectedCategory: null,
  title: '',
  description: '',
  locationAddress: '',
  locationLandmark: '',
  wardId: null,
  wardLabel: '',
  latitude: null,
  longitude: null,
  attachments: [],
  maxAttachmentSizeMb: 50,

  setLanguage: (language) => set({ language }),
  setStep: (step) => set({ step }),
  setCategory: (selectedCategory) => set({ selectedCategory }),
  setTitle: (title) => set({ title }),
  setDescription: (description) => set({ description }),
  setLocationAddress: (locationAddress) => set({ locationAddress }),
  setLocationLandmark: (locationLandmark) => set({ locationLandmark }),
  setWard: (wardId, wardLabel) => set({ wardId, wardLabel }),
  setCoords: (latitude, longitude) => set({ latitude, longitude }),
  setAttachments: (attachments) => set({ attachments }),
  removeAttachment: (id) =>
    set((state) => ({
      attachments: state.attachments.filter((a) => a.id !== id),
    })),
  setMaxAttachmentSizeMb: (maxAttachmentSizeMb) =>
    set({ maxAttachmentSizeMb }),
  reset: () =>
    set({
      step: 1,
      selectedCategory: null,
      title: '',
      description: '',
      locationAddress: '',
      locationLandmark: '',
      wardId: null,
      wardLabel: '',
      latitude: null,
      longitude: null,
      attachments: [],
    }),
}));
