import { SpecialsForm } from "@/components/specials-form"
import { SectionHeader } from "@/components/ui/section-header"

export default function NewSpecialPage() {
    return (
        <div className="space-y-8">
            <SectionHeader>Create New Special</SectionHeader>
            <SpecialsForm />
        </div>
    )
}
