import { getSpecial } from "@/app/actions/specials"
import { SpecialsForm } from "@/components/specials-form"
import { SectionHeader } from "@/components/ui/section-header"
import { notFound } from "next/navigation"

export default async function EditSpecialPage({ params }: { params: { id: string } }) {
    try {
        const special = await getSpecial(params.id)

        return (
            <div className="space-y-8">
                <SectionHeader>Edit Special</SectionHeader>
                <SpecialsForm special={special} />
            </div>
        )
    } catch (error) {
        notFound()
    }
}
