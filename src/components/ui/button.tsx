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
                    "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 font-fbBody tracking-wide",
                    {
                        'bg-fb-primary text-white hover:bg-fb-primary/90 shadow-md hover:shadow-lg transition-all': variant === 'default',
                        'bg-transparent border-2 border-fb-secondary text-fb-secondary hover:bg-fb-secondary hover:text-fb-bg font-bold': variant === 'secondary',
                        'border border-fb-muted bg-transparent hover:bg-fb-surface text-fb-text': variant === 'outline',
                        'hover:bg-fb-surface hover:text-fb-text': variant === 'ghost',
                        'bg-red-900 text-white hover:bg-red-900/90': variant === 'destructive',
                        'bg-fb-success text-white hover:bg-fb-success/90': variant === 'success',
                        'h-12 px-6 py-3 text-base': size === 'default',
                        'h-10 rounded-full px-4 text-sm': size === 'sm',
                        'h-14 rounded-full px-8 text-lg': size === 'lg',
                        'h-12 w-12': size === 'icon',
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
