import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen flex-col bg-fb-bg text-fb-text">
            <header className="sticky top-0 z-50 w-full border-b border-fb-surface-soft bg-fb-bg/95 backdrop-blur supports-[backdrop-filter]:bg-fb-bg/60">
                <div className="container flex h-20 items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        {/* <span className="text-xl font-bold uppercase tracking-tighter text-fb-primary font-fbHeading">
                            Friez n Burgz
                        </span> */}
                        <img src="/logo.png" alt="Friez n Burgz" className="h-12 w-auto object-contain" />
                    </Link>
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                        <Link href="/#menu" className="transition-colors hover:text-fb-primary">
                            Menu
                        </Link>
                        <Link href="/allergens" className="transition-colors hover:text-fb-primary">
                            Allergens
                        </Link>
                        <Link href="/customer-links" className="transition-colors hover:text-fb-primary">
                            Links
                        </Link>
                        <Link href="/recruitment" className="transition-colors hover:text-fb-primary">
                            Join Us
                        </Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        <Button asChild variant="default" size="sm" className="hidden md:inline-flex">
                            <Link href="/#menu">View Menu</Link>
                        </Button>
                        {/* Mobile Menu Toggle could go here, for now keeping it simple as per prompt "Right: simple button or icon" */}
                        <Button asChild variant="default" size="sm" className="md:hidden">
                            <Link href="/#menu">Menu</Link>
                        </Button>
                    </div>
                </div>
            </header>
            <main className="flex-1">
                {children}
            </main>
            <footer className="border-t border-fb-surface-soft bg-fb-surface py-8 md:py-0">
                <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
                    <p className="text-center text-sm leading-loose text-fb-muted md:text-left">
                        © 2026 Friez n Burgz. All rights reserved.
                    </p>
                    <div className="flex gap-4">
                        <Link href="/app" className="text-xs text-fb-muted hover:text-fb-text">
                            Admin Login
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}
