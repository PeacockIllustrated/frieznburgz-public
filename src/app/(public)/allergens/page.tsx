import { ALLERGEN_ITEMS } from "@/lib/data"
import { SectionHeader } from "@/components/ui/section-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Allergen } from "@/types"

export default function AllergensPage() {
    const allAllergens: Allergen[] = [
        'gluten', 'eggs', 'milk', 'soya', 'mustard', 'sesame', 'fish', 'celery', 'sulphites'
    ]

    return (
        <div className="container px-4 py-8 md:px-6 md:py-12">
            <SectionHeader>Allergen Information</SectionHeader>
            <div className="space-y-8">
                <div className="bg-fb-surface-soft/20 border border-fb-surface-soft rounded-xl p-6 text-center">
                    <p className="text-fb-muted text-lg leading-relaxed">
                        Please inform our staff if you have any allergies. While we take every precaution, cross-contamination is possible.
                    </p>
                </div>

                {/* Mobile View: Stacked Cards */}
                <div className="grid gap-6 md:hidden">
                    {ALLERGEN_ITEMS.map((item) => (
                        <Card key={item.id} className="border-2 border-fb-surface-soft">
                            <CardHeader className="pb-3 border-b border-fb-surface-soft/50">
                                <CardTitle className="text-xl text-fb-secondary">{item.name}</CardTitle>
                                <p className="text-sm text-fb-muted uppercase tracking-wider font-bold">{item.category}</p>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="flex flex-wrap gap-2">
                                    {item.allergens.length > 0 ? (
                                        item.allergens.map((allergen) => (
                                            <Badge key={allergen} variant="destructive" className="capitalize px-3 py-1 text-sm font-bold tracking-wide">
                                                {allergen}
                                            </Badge>
                                        ))
                                    ) : (
                                        <Badge variant="success" className="px-3 py-1 text-sm font-bold tracking-wide">No Common Allergens</Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Desktop View: Table */}
                <div className="hidden md:block overflow-hidden rounded-2xl border-2 border-fb-surface-soft bg-fb-surface shadow-xl">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-fb-surface-soft text-fb-text uppercase tracking-wider font-fbHeading">
                            <tr>
                                <th className="p-6 font-bold text-base">Item</th>
                                {allAllergens.map((allergen) => (
                                    <th key={allergen} className="p-6 font-bold text-center text-xs">{allergen}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-fb-surface-soft/50">
                            {ALLERGEN_ITEMS.map((item) => (
                                <tr key={item.id} className="hover:bg-fb-surface-soft/20 transition-colors">
                                    <td className="p-6 font-medium">
                                        <span className="text-lg font-bold text-fb-text block mb-1">{item.name}</span>
                                        <span className="block text-xs text-fb-muted uppercase tracking-wider font-bold">{item.category}</span>
                                    </td>
                                    {allAllergens.map((allergen) => (
                                        <td key={allergen} className="p-6 text-center align-middle">
                                            {item.allergens.includes(allergen) ? (
                                                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-fb-primary shadow-lg shadow-fb-primary/30" title={`Contains ${allergen}`}>
                                                    <span className="sr-only">Yes</span>
                                                </div>
                                            ) : (
                                                <span className="text-fb-surface-soft font-bold text-xl">·</span>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
