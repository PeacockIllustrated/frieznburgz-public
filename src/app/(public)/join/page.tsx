import { OnboardingForm } from "@/components/onboarding-form"
import { SectionHeader } from "@/components/ui/section-header"

export default function JoinPage() {
    return (
        <div className="flex flex-col gap-12 pb-20 pt-12">
            <section className="container text-center space-y-4">
                <SectionHeader className="text-fb-primary text-5xl md:text-7xl mb-4">JOIN THE TEAM!</SectionHeader>
                <p className="text-2xl md:text-3xl font-black text-fb-secondary max-w-2xl mx-auto uppercase leading-tight font-fbHeading">
                    We're on a mission to create the best burgers around.
                </p>
                <p className="text-xl md:text-2xl font-bold text-fb-primary max-w-2xl mx-auto uppercase tracking-wide">
                    Apply now and join our mission!
                </p>
                <div className="w-24 h-2 bg-fb-secondary mx-auto mt-8 rounded-full"></div>
            </section>

            <section className="container">
                <OnboardingForm />
            </section>
        </div>
    )
}
