import { SectionHeader } from "@/components/ui/section-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ExternalLink } from "lucide-react"

export default function CustomerLinksPage() {
    const links = [
        {
            title: "Leave a Google Review",
            description: "Tell us what you loved! It helps us a lot.",
            url: "https://google.com", // Placeholder
            cta: "Review on Google",
            variant: "default" as const
        },
        {
            title: "Follow us on Instagram",
            description: "Tag us in your burger pics @frieznburgz",
            url: "https://instagram.com", // Placeholder
            cta: "Go to Instagram",
            variant: "secondary" as const
        },
        {
            title: "Like us on Facebook",
            description: "Stay updated with events and news.",
            url: "https://facebook.com", // Placeholder
            cta: "Go to Facebook",
            variant: "outline" as const
        },
        {
            title: "TikTok",
            description: "Watch our behind the scenes.",
            url: "https://tiktok.com", // Placeholder
            cta: "Watch on TikTok",
            variant: "outline" as const
        }
    ]

    return (
        <div className="container px-4 py-8 md:px-6 md:py-12">
            <SectionHeader className="text-center md:text-left">Customer Links</SectionHeader>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {links.map((link) => (
                    <Card key={link.title} className="flex flex-col border-2 border-fb-surface-soft hover:border-fb-primary transition-all hover:-translate-y-1 hover:shadow-xl group">
                        <CardHeader>
                            <CardTitle className="text-xl group-hover:text-fb-primary transition-colors">{link.title}</CardTitle>
                            <CardDescription className="text-base">{link.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="mt-auto pt-4">
                            <Button asChild variant={link.variant} className="w-full gap-2 shadow-none group-hover:shadow-md">
                                <Link href={link.url} target="_blank" rel="noopener noreferrer">
                                    {link.cta}
                                    <ExternalLink className="h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
