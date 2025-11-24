import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                {
                    'border-transparent bg-fb-primary text-white hover:bg-fb-primary/80': variant === 'default',
                    'border-transparent bg-fb-secondary text-fb-bg hover:bg-fb-secondary/80': variant === 'secondary',
                    'text-fb-text': variant === 'outline',
                    'border-transparent bg-red-900 text-white hover:bg-red-900/80': variant === 'destructive',
                    'border-transparent bg-fb-success text-white hover:bg-fb-success/80': variant === 'success',
                },
                className
            )}
            {...props}
        />
    )
}

export { Badge }
