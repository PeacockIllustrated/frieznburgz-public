'use client'

import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Allergen } from "@/types"
import { cn } from "@/lib/utils"

interface AllergenSelectorProps {
    value: Allergen[]
    onChange: (value: Allergen[]) => void
}

const ALLERGENS: { value: Allergen; label: string }[] = [
    { value: 'gluten', label: 'Gluten' },
    { value: 'eggs', label: 'Eggs' },
    { value: 'milk', label: 'Milk' },
    { value: 'soya', label: 'Soya' },
    { value: 'mustard', label: 'Mustard' },
    { value: 'sesame', label: 'Sesame' },
    { value: 'fish', label: 'Fish' },
    { value: 'celery', label: 'Celery' },
    { value: 'sulphites', label: 'Sulphites' },
]

export function AllergenSelector({ value = [], onChange }: AllergenSelectorProps) {
    const toggleAllergen = (allergen: Allergen) => {
        if (value.includes(allergen)) {
            onChange(value.filter(a => a !== allergen))
        } else {
            onChange([...value, allergen])
        }
    }

    return (
        <div className="space-y-3">
            <Label>Allergens</Label>
            <div className="flex flex-wrap gap-2">
                {ALLERGENS.map((allergen) => {
                    const isSelected = value.includes(allergen.value)
                    return (
                        <Badge
                            key={allergen.value}
                            variant={isSelected ? "default" : "outline"}
                            className={cn(
                                "cursor-pointer text-sm py-1.5 px-3 transition-all hover:scale-105 select-none",
                                isSelected
                                    ? "bg-fb-primary hover:bg-fb-primary/90 border-fb-primary text-white"
                                    : "bg-fb-bg hover:bg-fb-surface hover:border-fb-primary text-fb-text border-fb-surface-soft"
                            )}
                            onClick={() => toggleAllergen(allergen.value)}
                        >
                            {allergen.label}
                        </Badge>
                    )
                })}
            </div>
            <p className="text-xs text-fb-muted">
                Select all allergens present in this item.
            </p>
        </div>
    )
}
