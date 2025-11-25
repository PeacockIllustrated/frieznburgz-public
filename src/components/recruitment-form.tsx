'use client'

import { Suspense } from "react"
import { RecruitmentFormContent } from "./recruitment-form-content"

export function RecruitmentForm() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-fb-muted">Loading form...</div>}>
            <RecruitmentFormContent />
        </Suspense>
    )
}
