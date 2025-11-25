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
        <div className="flex flex-col gap-20 pb-20">
            {/* Hero Section */}
            <section className="relative flex flex-col items-center justify-center gap-8 px-4 py-24 text-center md:py-32 bg-fb-bg border-b border-fb-surface-soft">
                <div className="space-y-6 max-w-4xl">
                    <h1 className="text-5xl font-bold uppercase tracking-tighter sm:text-7xl md:text-8xl font-fbHeading text-fb-primary leading-[0.9]">
                        Friez <span className="text-fb-text">n</span> Burgz
                    </h1>
                    <p className="mx-auto max-w-[600px] text-fb-muted text-lg md:text-2xl font-fbBody leading-relaxed">
                        Smashed patties, crispy chix, and shakes that bring all the boys to the yard.
                    </p>
                </div>
                <div className="flex flex-col gap-4 w-full max-w-xs sm:flex-row sm:max-w-md sm:justify-center">
                    <Button asChild size="lg" className="w-full text-lg shadow-xl shadow-fb-primary/20">
                        <Link href="#specials">See This Week’s Specials</Link>
                    </Button>
                </div>
                {/* Placeholder for Hero Image */}
                <div className="mt-12 h-64 w-full max-w-4xl rounded-3xl bg-fb-surface-soft/10 flex items-center justify-center border-2 border-dashed border-fb-surface-soft/30">
                    <span className="text-fb-muted font-fbHeading uppercase tracking-widest opacity-50">Hero Image Placeholder</span>
                </div>
            </section>

            {/* Specials Section */}
            <section id="specials" className="container px-4 md:px-6">
                <SectionHeader className="text-center md:text-left">This Week’s Specials</SectionHeader>
                <div className="grid gap-8 md:grid-cols-3">
                    {specials.length > 0 ? (
                        specials.map((special) => (
                            <Card key={special.id} className="overflow-hidden border-2 border-fb-surface-soft hover:border-fb-primary transition-colors group">
                                {special.image_url && (
                                    <div className="aspect-video w-full bg-fb-surface-soft/50" />
                                    // In real app, use Next.js Image with special.image_url
                                )}
                                <CardHeader className="pb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <Badge variant="secondary" className="uppercase font-bold tracking-wider text-xs">{special.type}</Badge>
                                        {special.price && <span className="font-bold text-fb-primary text-xl font-fbHeading">£{special.price.toFixed(2)}</span>}
                                    </div>
                                    <CardTitle className="text-2xl group-hover:text-fb-primary transition-colors">{special.title}</CardTitle>
                                    {special.subtitle && <CardDescription className="text-base text-fb-muted/80">{special.subtitle}</CardDescription>}
                                </CardHeader>
                                <CardContent>
                                    <p className="text-fb-muted line-clamp-3 leading-relaxed">{special.description}</p>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full p-12 rounded-2xl border-2 border-dashed border-fb-surface-soft bg-fb-surface/30 text-center">
                            <p className="text-fb-muted text-lg">Check back soon for new specials!</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Menu Section */}
            <section id="menu" className="container px-4 md:px-6">
                <SectionHeader className="text-center md:text-left mb-12">Menu</SectionHeader>
                <div className="space-y-16">
                    {categories.map((category) => {
                        const items = MENU_ITEMS.filter(item => item.category === category)
                        if (items.length === 0) return null

                        return (
                            <div key={category} className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <h3 className="text-3xl font-bold font-fbHeading text-fb-secondary uppercase tracking-wider">{category}</h3>
                                    <div className="h-px flex-1 bg-fb-surface-soft/50"></div>
                                </div>
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {items.map((item) => (
                                        <Card key={item.id} className="border-fb-surface-soft/50 bg-fb-surface/40 hover:bg-fb-surface transition-colors">
                                            <CardHeader className="pb-3">
                                                <div className="flex items-start justify-between gap-4">
                                                    <h4 className="font-bold text-xl font-fbHeading tracking-wide">{item.name}</h4>
                                                    {item.price && <span className="font-bold text-fb-primary font-fbHeading">£{item.price.toFixed(2)}</span>}
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-fb-muted mb-4 leading-relaxed">{item.description}</p>
                                                <div className="flex gap-2">
                                                    {item.is_vegan && <Badge variant="success" className="text-[10px] h-5 px-2 font-bold tracking-wider">VG</Badge>}
                                                    {item.is_veggie && <Badge variant="success" className="text-[10px] h-5 px-2 font-bold tracking-wider">V</Badge>}
                                                    {item.is_spicy && <Badge variant="destructive" className="text-[10px] h-5 px-2 font-bold tracking-wider">HOT</Badge>}
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
                <SectionHeader className="text-center md:text-left">Locations</SectionHeader>
                <div className="grid gap-6 md:grid-cols-2">
                    {LOCATIONS.map((loc) => (
                        <Card key={loc.name} className="bg-fb-surface border-2 border-fb-surface-soft hover:border-fb-secondary transition-colors">
                            <CardHeader>
                                <CardTitle className="text-fb-secondary">{loc.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-fb-text text-lg">{loc.address}</p>
                                <div className="p-4 rounded-lg bg-fb-bg/50 border border-fb-surface-soft">
                                    <p className="font-medium text-fb-muted text-sm uppercase tracking-wider mb-1">Opening Times</p>
                                    <p className="text-fb-accent font-bold">{loc.times}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="container px-4 md:px-6 pb-12">
                <div className="grid gap-8 md:grid-cols-2">
                    <Card className="bg-fb-surface-soft/10 border-fb-surface-soft">
                        <CardHeader>
                            <CardTitle className="text-fb-primary">Join the Team</CardTitle>
                            <CardDescription className="text-lg">We are always looking for burger flippers.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild variant="outline" size="lg" className="w-full border-2 hover:bg-fb-primary hover:border-fb-primary hover:text-white">
                                <Link href="/recruitment">Apply Now</Link>
                            </Button>
                        </CardContent>
                    </Card>
                    <Card className="bg-fb-surface-soft/10 border-fb-surface-soft">
                        <CardHeader>
                            <CardTitle className="text-fb-secondary">Have Your Say</CardTitle>
                            <CardDescription className="text-lg">Loved it? Hated it? Let us know.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild variant="outline" size="lg" className="w-full border-2 hover:bg-fb-secondary hover:border-fb-secondary hover:text-fb-bg">
                                <Link href="/customer-links">Leave a Review</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    )
}
