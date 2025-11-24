'use client'

import { setActiveSpecial } from "@/app/actions/specials"
import { Button } from "@/components/ui/button"
import { SpecialType } from "@/types"
import { useTransition } from "react"

export function SetActiveButton({ id, type, isActive }: { id: string, type: SpecialType, isActive: boolean }) {
    const [isPending, startTransition] = useTransition()

    if (isActive) {
        return <Button size="sm" variant="success" disabled className="cursor-default">Active</Button>
    }

    return (
        <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() => startTransition(() => setActiveSpecial(id, type))}
        >
            {isPending ? 'Updating...' : 'Set Active'}
        </Button>
    )
}
