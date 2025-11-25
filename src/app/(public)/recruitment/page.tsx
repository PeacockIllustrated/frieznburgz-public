
import { Suspense } from 'react';
import { RecruitmentForm } from "@/components/recruitment-form";
import { SectionHeader } from "@/components/ui/section-header";

export const dynamic = 'force-dynamic';

export default function RecruitmentPage() {
    return (
        <div className="container max-w-2xl px-4 py-8 md:px-6 md:py-12">
            <SectionHeader>Join the Team</SectionHeader>
            <div className="space-y-6">
                <p className="text-fb-muted">
                    We’re always looking for passionate people to join the Friez n Burgz family.
                    If you love great food and good vibes, fill out the form below.
                </p>
                <div className="rounded-xl border border-fb-surface-soft bg-fb-surface p-6 md:p-8">
                    <Suspense fallback={<p>Loading form…</p>}>
                        <RecruitmentForm />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
