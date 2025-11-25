import * as React from "react"
import { cn } from "@/lib/utils"

export interface SectionHeaderProps extends React.HTMLAttributes<HTMLHeadingElement> { }

function SectionHeader({ className, children, ...props }: SectionHeaderProps) {
    return (
        <h2
            className={cn(
                "text-3xl md:text-4xl font-bold uppercase tracking-wide font-fbHeading text-fb-text mb-8",
                className
            )}
            {...props}
        >
            {children}
        </h2>
    )
}

export { SectionHeader }
