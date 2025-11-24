import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean
    variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success'
    size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    {
                        'bg-fb-primary text-white hover:bg-fb-primary/90': variant === 'default',
                        'bg-fb-secondary text-fb-bg hover:bg-fb-secondary/80': variant === 'secondary',
                        'border border-fb-muted bg-transparent hover:bg-fb-surface text-fb-text': variant === 'outline',
                        'hover:bg-fb-surface hover:text-fb-text': variant === 'ghost',
                        'bg-red-900 text-white hover:bg-red-900/90': variant === 'destructive',
                        'bg-fb-success text-white hover:bg-fb-success/90': variant === 'success',
                        'h-10 px-4 py-2': size === 'default',
                        'h-9 rounded-md px-3': size === 'sm',
                        'h-12 rounded-full px-8 text-base': size === 'lg',
                        'h-10 w-10': size === 'icon',
                    },
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
