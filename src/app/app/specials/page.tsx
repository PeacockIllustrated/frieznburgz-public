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
                                <div className="mb-6">
                                    <h4 className="text-sm font-bold uppercase text-fb-muted mb-2">Active Now</h4>
                                    <Card className="border-fb-primary/50 bg-fb-surface-soft/20">
                                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                            <div>
                                                <CardTitle className="text-xl">{activeSpecial.title}</CardTitle>
                                                <CardDescription>{activeSpecial.subtitle}</CardDescription>
                                            </div>
                                            <Badge variant="success">Active</Badge>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center justify-between mt-4">
                                                <span className="font-bold text-fb-primary">£{activeSpecial.price?.toFixed(2)}</span>
                                                <div className="flex gap-2">
                                                    <Button asChild variant="outline" size="sm">
                                                        <Link href={`/app/specials/${activeSpecial.id}`}>Edit</Link>
                                                    </Button>
                                                    <SetActiveButton id={activeSpecial.id} type={activeSpecial.type} isActive={true} />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            ) : (
                                <div className="p-4 rounded-xl border border-dashed border-fb-surface-soft text-center text-fb-muted mb-6">
                                    No active special selected.
                                </div>
                            )}

                            {/* Inactive Specials */}
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {inactiveSpecials.map((special) => (
                                    <Card key={special.id} className="opacity-80 hover:opacity-100 transition-opacity">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg">{special.title}</CardTitle>
                                            <p className="text-xs text-fb-muted truncate">{special.subtitle}</p>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center justify-between mt-4">
                                                <span className="text-sm font-mono">£{special.price?.toFixed(2)}</span>
                                                <div className="flex gap-2">
                                                    <Button asChild variant="ghost" size="sm">
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
