import { getSpecial } from "@/app/actions/specials"
import { SpecialsForm } from "@/components/specials-form"
import { SectionHeader } from "@/components/ui/section-header"
import { notFound } from "next/navigation"

export default async function EditSpecialPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;
    const special = await getSpecial(id);

    if (!special) {
        notFound();
    }

    return (
        <div className="space-y-8">
            <SectionHeader>Edit Special</SectionHeader>
            <SpecialsForm special={special} />
        </div>
    )
}
