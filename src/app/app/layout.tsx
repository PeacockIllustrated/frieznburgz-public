import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    return (
        <html lang="en" suppressHydrationWarning>
            <body className={cn('min-h-screen bg-fb-bg font-fbBody antialiased')}>
                <div className="min-h-screen bg-fb-bg text-fb-text">
                    <header className="border-b border-fb-surface-soft bg-fb-surface">
                        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                            <Link href="/app" className="flex items-center gap-2">
                                <span className="text-lg font-bold uppercase tracking-tighter text-fb-primary font-fbHeading">
                                    F&B Admin
                                </span>
                            </Link>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-fb-muted hidden md:inline-block">
                                    {user.email}
                                </span>
                                <form action="/auth/signout" method="post">
                                    <Button variant="ghost" size="sm">
                                        Sign Out
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </header>
                    <main className="container px-4 py-8 md:px-6 md:py-12">{children}</main>
                </div>
            </body>
        </html>
    )
}
