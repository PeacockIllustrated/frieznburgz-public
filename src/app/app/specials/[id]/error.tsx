'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <Card className="w-full max-w-md border-destructive/50 bg-destructive/10">
                <CardHeader>
                    <CardTitle className="text-destructive">Something went wrong!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm font-medium">{error.message}</p>
                    {error.digest && (
                        <p className="text-xs text-muted-foreground">Digest: {error.digest}</p>
                    )}
                    <div className="flex gap-4">
                        <Button onClick={() => reset()}>Try again</Button>
                        <Button variant="outline" onClick={() => window.history.back()}>Go Back</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
