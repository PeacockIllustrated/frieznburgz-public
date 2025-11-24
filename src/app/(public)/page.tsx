import { getActiveSpecials } from "@/app/actions/specials"
import { MENU_ITEMS, LOCATIONS } from "@/lib/data"
import { MenuCategory } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SectionHeader } from "@/components/ui/section-header"
import Link from "next/link"

export default async function HomePage() {
    const specials = await getActiveSpecials()

    const categories: MenuCategory[] = [
        'Beef Burgz',
        'Chix Burgz',
        'Sides',
        'Breakfast',
        'Milkshakez'
    ]

    return (
        <div className="flex flex-col gap-16 pb-16">
            {/* Hero Section */}
            <section className="relative flex flex-col items-center justify-center gap-6 px-4 py-24 text-center md:py-32 bg-fb-bg">
                <div className="space-y-4">
                    <h1 className="text-4xl font-bold uppercase tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl font-fbHeading text-fb-primary">
                        Friez n Burgz
                    </h1>
                    <p className="mx-auto max-w-[600px] text-fb-muted md:text-xl font-fbBody">
                        Smashed patties, crispy chix, and shakes that bring all the boys to the yard.
                    </p>
                </div>
                <div className="flex flex-col gap-4 min-[400px]:flex-row">
                    <Button asChild size="lg" className="w-full min-[400px]:w-auto">
                        <Link href="#specials">See This Week’s Specials</Link>
                    </Button>
                </div>
                {/* Placeholder for Hero Image */}
                <div className="mt-8 h-64 w-full max-w-3xl rounded-xl bg-fb-surface-soft/20 flex items-center justify-center border border-fb-surface-soft border-dashed">
                    <span className="text-fb-muted">Hero Image Placeholder</span>
                </div>
            </section>

            {/* Specials Section */}
            <section id="specials" className="container px-4 md:px-6">
                <SectionHeader>This Week’s Specials</SectionHeader>
                <div className="grid gap-6 md:grid-cols-3">
                    {specials.length > 0 ? (
                        specials.map((special) => (
                            <Card key={special.id} className="overflow-hidden">
                                {special.image_url && (
                                    <div className="aspect-video w-full bg-fb-surface-soft/50" />
                                    // In real app, use Next.js Image with special.image_url
                                )}
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <Badge variant="secondary" className="uppercase">{special.type}</Badge>
                                        {special.price && <span className="font-bold text-fb-primary">£{special.price.toFixed(2)}</span>}
                                    </div>
                                    <CardTitle className="mt-2 text-xl">{special.title}</CardTitle>
                                    {special.subtitle && <CardDescription>{special.subtitle}</CardDescription>}
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-fb-muted line-clamp-3">{special.description}</p>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <p className="text-fb-muted col-span-full text-center py-10">Check back soon for new specials!</p>
                    )}
                </div>
            </section>

            {/* Menu Section */}
            <section id="menu" className="container px-4 md:px-6">
                <SectionHeader>Menu</SectionHeader>
                <div className="space-y-12">
                    {categories.map((category) => {
                        const items = MENU_ITEMS.filter(item => item.category === category)
                        if (items.length === 0) return null

                        return (
                            <div key={category} className="space-y-6">
                                <h3 className="text-2xl font-bold font-fbHeading text-fb-secondary uppercase tracking-wider">{category}</h3>
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {items.map((item) => (
                                        <Card key={item.id} className="border-fb-surface-soft/50 bg-fb-surface/50">
                                            <CardHeader className="pb-2">
                                                <div className="flex items-start justify-between gap-4">
                                                    <h4 className="font-bold text-lg">{item.name}</h4>
                                                    {item.price && <span className="font-mono text-fb-primary">£{item.price.toFixed(2)}</span>}
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm text-fb-muted mb-3">{item.description}</p>
                                                <div className="flex gap-2">
                                                    {item.is_vegan && <Badge variant="success" className="text-[10px] h-5 px-1.5">VG</Badge>}
                                                    {item.is_veggie && <Badge variant="success" className="text-[10px] h-5 px-1.5">V</Badge>}
                                                    {item.is_spicy && <Badge variant="destructive" className="text-[10px] h-5 px-1.5">Hot</Badge>}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* Locations Section */}
            <section className="container px-4 md:px-6">
                <SectionHeader>Locations</SectionHeader>
                <div className="grid gap-6 md:grid-cols-2">
                    {LOCATIONS.map((loc) => (
                        <Card key={loc.name}>
                            <CardHeader>
                                <CardTitle>{loc.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <p className="text-fb-muted">{loc.address}</p>
                                <p className="font-medium text-fb-secondary">{loc.times}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="container px-4 md:px-6">
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="bg-fb-surface-soft/20 border-fb-surface-soft">
                        <CardHeader>
                            <CardTitle>Join the Team</CardTitle>
                            <CardDescription>We are always looking for burger flippers.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/recruitment">Apply Now</Link>
                            </Button>
                        </CardContent>
                    </Card>
                    <Card className="bg-fb-surface-soft/20 border-fb-surface-soft">
                        <CardHeader>
                            <CardTitle>Have Your Say</CardTitle>
                            <CardDescription>Loved it? Hated it? Let us know.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/customer-links">Leave a Review</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    )
}
