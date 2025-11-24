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
            <div className="space-y-6">
                <p className="text-fb-muted">
                    Please inform our staff if you have any allergies. While we take every precaution, cross-contamination is possible.
                </p>

                {/* Mobile View: Stacked Cards */}
                <div className="grid gap-4 md:hidden">
                    {ALLERGEN_ITEMS.map((item) => (
                        <Card key={item.id}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">{item.name}</CardTitle>
                                <p className="text-xs text-fb-muted uppercase tracking-wider">{item.category}</p>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {item.allergens.length > 0 ? (
                                        item.allergens.map((allergen) => (
                                            <Badge key={allergen} variant="destructive" className="capitalize">
                                                {allergen}
                                            </Badge>
                                        ))
                                    ) : (
                                        <Badge variant="success">No Common Allergens</Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Desktop View: Table */}
                <div className="hidden md:block overflow-x-auto rounded-xl border border-fb-surface-soft bg-fb-surface">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-fb-surface-soft/50 text-fb-text uppercase tracking-wider">
                            <tr>
                                <th className="p-4 font-bold">Item</th>
                                {allAllergens.map((allergen) => (
                                    <th key={allergen} className="p-4 font-bold text-center">{allergen}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-fb-surface-soft">
                            {ALLERGEN_ITEMS.map((item) => (
                                <tr key={item.id} className="hover:bg-fb-surface-soft/20">
                                    <td className="p-4 font-medium">
                                        {item.name}
                                        <span className="block text-xs text-fb-muted">{item.category}</span>
                                    </td>
                                    {allAllergens.map((allergen) => (
                                        <td key={allergen} className="p-4 text-center">
                                            {item.allergens.includes(allergen) ? (
                                                <span className="inline-block w-3 h-3 rounded-full bg-fb-primary" title={`Contains ${allergen}`} />
                                            ) : (
                                                <span className="text-fb-surface-soft">-</span>
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
