
import { Suspense } from 'react';
import { RecruitmentForm } from "@/components/recruitment-form";
import { SectionHeader } from "@/components/ui/section-header";

export const dynamic = 'force-dynamic';

export default function RecruitmentPage() {
    return (
        <div className="container max-w-2xl px-4 py-8 md:px-6 md:py-12">
            <SectionHeader className="text-center">Join the Team</SectionHeader>
            <div className="space-y-8">
                <div className="bg-fb-surface-soft/20 border border-fb-surface-soft rounded-xl p-6 text-center">
                    <p className="text-fb-muted text-lg leading-relaxed">
                        We’re always looking for passionate people to join the Friez n Burgz family.
                        If you love great food and good vibes, fill out the form below.
                    </p>
                </div>
                <div className="rounded-2xl border-2 border-fb-surface-soft bg-fb-surface p-6 md:p-10 shadow-xl">
                    <Suspense fallback={<div className="flex justify-center p-8"><p className="text-fb-muted animate-pulse">Loading form...</p></div>}>
                        <RecruitmentForm />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
