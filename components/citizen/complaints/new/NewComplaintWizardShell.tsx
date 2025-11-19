// FILE: components/citizen/complaints/new/NewComplaintWizardShell.tsx
import { WizardHeader } from "./WizardHeader";
import { WizardProgress } from "./WizardProgress";
import { StepCategory } from "./StepCategory";
import { StepDetails } from "./StepDetails";
import { StepReview } from "./StepReview";
import { useCitizenComplaintWizard } from "@/stores/useCitizenComplaintWizard";

export function NewComplaintWizardShell() {
  const { step } = useCitizenComplaintWizard();

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 sm:gap-6">
      <WizardHeader />

      <section className="rounded-2xl border border-glass-soft bg-surface-elevated/90 px-4 py-3 shadow-glass-md backdrop-blur-xl sm:px-5 sm:py-4">
        <WizardProgress />
      </section>

      <section className="rounded-2xl border border-glass-soft bg-surface-elevated/90 px-4 py-4 shadow-glass-md backdrop-blur-xl sm:px-5 sm:py-5">
        {step === 1 && <StepCategory />}
        {step === 2 && <StepDetails />}
        {step === 3 && <StepReview />}
      </section>
    </div>
  );
}
