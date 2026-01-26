import { Suspense } from 'react';
import { OnboardingForm } from "@/components/onboarding-form";
import { SectionHeader } from "@/components/ui/section-header";

export const dynamic = 'force-dynamic';

export default function RecruitmentPage() {
    return (
        <div className="container max-w-2xl px-4 py-8 md:px-6 md:py-12">
            <SectionHeader className="text-center">Join the Team</SectionHeader>
            <div className="space-y-8">
                <div className="bg-fb-surface-soft/20 border border-fb-surface-soft rounded-xl p-6 text-center">
                    <p className="text-fb-muted text-lg leading-relaxed font-bold uppercase tracking-tight">
                        We’re always looking for passionate people to join the Friez n Burgz family.
                        If you love great food and good vibes, fill out the form below.
                    </p>
                </div>
                <div className="mt-8">
                    <Suspense fallback={<div className="flex justify-center p-8"><p className="text-fb-muted animate-pulse font-black uppercase">Loading form...</p></div>}>
                        <OnboardingForm />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
