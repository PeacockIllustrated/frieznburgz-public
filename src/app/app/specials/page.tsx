import { getSpecials } from "@/app/actions/specials"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SectionHeader } from "@/components/ui/section-header"
import { SetActiveButton } from "@/components/set-active-button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { SpecialType } from "@/types"

export const dynamic = 'force-dynamic'

export default async function SpecialsPage() {
    const specials = await getSpecials()

    const types: SpecialType[] = ['burger', 'fillet', 'shake']

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <SectionHeader className="mb-0">Manage Specials</SectionHeader>
                <Button asChild>
                    <Link href="/app/specials/new">
                        <Plus className="mr-2 h-4 w-4" /> New Special
                    </Link>
                </Button>
            </div>

            <div className="space-y-12">
                {types.map((type) => {
                    const typeSpecials = specials.filter(s => s.type === type)
                    const activeSpecial = typeSpecials.find(s => s.is_active)
                    const inactiveSpecials = typeSpecials.filter(s => !s.is_active)

                    return (
                        <div key={type} className="space-y-4">
                            <h3 className="text-2xl font-bold capitalize text-fb-secondary font-fbHeading">{type} Specials</h3>

                            {/* Active Special */}
                            {activeSpecial ? (
                                <div className="mb-8">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="h-2 w-2 rounded-full bg-fb-success animate-pulse"></div>
                                        <h4 className="text-sm font-bold uppercase text-fb-success tracking-wider">Active Now</h4>
                                    </div>
                                    <Card className="border-2 border-fb-primary bg-fb-surface-soft/10 shadow-lg shadow-fb-primary/10">
                                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                            <div>
                                                <CardTitle className="text-2xl text-fb-primary">{activeSpecial.title}</CardTitle>
                                                <CardDescription className="text-lg mt-1">{activeSpecial.subtitle}</CardDescription>
                                            </div>
                                            <Badge variant="success" className="px-3 py-1 text-sm font-bold tracking-wide">ACTIVE</Badge>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center justify-between mt-6">
                                                <span className="font-bold text-fb-text text-2xl font-fbHeading">£{activeSpecial.price?.toFixed(2)}</span>
                                                <div className="flex gap-3">
                                                    <Button asChild variant="outline" size="sm" className="border-fb-surface-soft hover:border-fb-text">
                                                        <Link href={`/app/specials/${activeSpecial.id}`}>Edit</Link>
                                                    </Button>
                                                    <SetActiveButton id={activeSpecial.id} type={activeSpecial.type} isActive={true} />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            ) : (
                                <div className="p-8 rounded-2xl border-2 border-dashed border-fb-surface-soft text-center text-fb-muted mb-8 bg-fb-surface/30">
                                    <p>No active special selected.</p>
                                </div>
                            )}

                            {/* Inactive Specials */}
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {inactiveSpecials.map((special) => (
                                    <Card key={special.id} className="opacity-70 hover:opacity-100 transition-all hover:border-fb-secondary hover:shadow-md group">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg group-hover:text-fb-secondary transition-colors">{special.title}</CardTitle>
                                            <p className="text-sm text-fb-muted truncate">{special.subtitle}</p>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center justify-between mt-4">
                                                <span className="text-base font-bold text-fb-muted group-hover:text-fb-text transition-colors">£{special.price?.toFixed(2)}</span>
                                                <div className="flex gap-2">
                                                    <Button asChild variant="ghost" size="sm" className="hover:bg-fb-surface-soft">
                                                        <Link href={`/app/specials/${special.id}`}>Edit</Link>
                                                    </Button>
                                                    <SetActiveButton id={special.id} type={special.type} isActive={false} />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                            {inactiveSpecials.length === 0 && !activeSpecial && (
                                <p className="text-fb-muted italic">No specials found for this category.</p>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
