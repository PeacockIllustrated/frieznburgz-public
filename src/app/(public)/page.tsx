import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { SectionHeader } from "@/components/ui/section-header"
import Link from "next/link"
import { MENU_ITEMS, LOCATIONS } from "@/lib/data"

export default function HomePage() {
    const promotedSpecials = [
        {
            title: "THE SLOPPY JOE BURGZ",
            description: "7oz beef patty with sloppy joe mix, multiple cheeses, jalapeños, crispy onions, loaded friez, etc.",
            price: 13.00,
            image: "/placeholder-sloppy-joe.jpg" // Placeholder
        },
        {
            title: "GARLIC PARM BITEZ",
            description: "Bite-sized garlic-parm pieces.",
            price: 5.50,
            subtitle: "+ friez for £2.50"
        },
        {
            title: "THE BISCOFF SHAKE",
            description: "Biscuit caramel shake with cream and crushed biscuits.",
            price: 5.50,
            priceLarge: 6.50
        }
    ]

    return (
        <div className="flex flex-col gap-16 pb-20">
            {/* Breakfast Hero */}
            <section className="relative flex flex-col items-center justify-center gap-6 px-4 py-20 text-center bg-fb-surface border-b-4 border-fb-secondary overflow-hidden">
                <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-5"></div> {/* Texture placeholder */}
                <div className="relative z-10 space-y-4 max-w-3xl">
                    <Badge variant="secondary" className="text-lg px-4 py-1 mb-4 animate-pulse">NEW!</Badge>
                    <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter font-fbHeading text-fb-primary leading-none drop-shadow-lg">
                        Breakfast <span className="text-fb-text">Hero</span>
                    </h1>
                    <div className="bg-fb-bg/80 backdrop-blur-sm p-6 rounded-xl border border-fb-surface-soft inline-block">
                        <p className="text-2xl md:text-3xl font-bold text-fb-secondary font-fbHeading uppercase tracking-wide">
                            Now doing BREAKFAST!
                        </p>
                        <p className="text-xl text-fb-text mt-2 font-fbBody">
                            fri–sat | 9am–11am
                        </p>
                    </div>
                </div>
                <div className="relative z-10 mt-4">
                    <Button asChild size="lg" className="text-lg px-8 py-6 shadow-xl shadow-fb-primary/20 hover:scale-105 transition-transform">
                        <Link href="#breakfast">View Breakfast Menu</Link>
                    </Button>
                </div>
            </section>

            {/* Promoted Specials */}
            <section className="container px-4 md:px-6">
                <SectionHeader className="text-center md:text-left border-l-8 border-fb-primary pl-4">Don't Miss These</SectionHeader>
                <div className="grid gap-8 md:grid-cols-3">
                    {promotedSpecials.map((special, idx) => (
                        <Card key={idx} className="group border-2 border-fb-surface-soft hover:border-fb-accent transition-all hover:-translate-y-2 overflow-hidden bg-fb-surface">
                            <div className="h-48 bg-fb-surface-soft/30 flex items-center justify-center relative overflow-hidden">
                                <span className="text-fb-muted/20 font-fbHeading text-4xl uppercase rotate-12 transform">Image</span>
                                <div className="absolute inset-0 bg-gradient-to-t from-fb-surface to-transparent opacity-80"></div>
                            </div>
                            <CardHeader className="relative -mt-12 pt-0">
                                <div className="bg-fb-primary text-white px-4 py-1 rounded-full inline-block text-sm font-bold uppercase tracking-wider mb-2 shadow-lg">
                                    Special
                                </div>
                                <CardTitle className="text-2xl md:text-3xl text-fb-text group-hover:text-fb-accent transition-colors">
                                    {special.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-fb-muted text-lg leading-relaxed">{special.description}</p>
                                <div className="flex items-end justify-between border-t border-fb-surface-soft pt-4 mt-4">
                                    <div className="flex flex-col">
                                        <span className="text-3xl font-bold text-fb-primary font-fbHeading">£{special.price.toFixed(2)}</span>
                                        {special.priceLarge && <span className="text-sm text-fb-muted">Large: £{special.priceLarge.toFixed(2)}</span>}
                                    </div>
                                    {special.subtitle && <Badge variant="outline" className="text-fb-secondary border-fb-secondary">{special.subtitle}</Badge>}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Main Menu */}
            <section id="menu" className="container px-4 md:px-6 space-y-20">

                {/* Beef Burgz */}
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-fb-surface-soft pb-4">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-bold font-fbHeading text-fb-primary uppercase tracking-wide">Beef Burgz</h2>
                            <p className="text-fb-muted text-lg mt-2">All “burgz” are doubled & smashed.</p>
                        </div>
                        <div className="text-2xl font-bold text-fb-text bg-fb-surface px-4 py-2 rounded-lg border border-fb-surface-soft">
                            £8.50 <span className="text-sm font-normal text-fb-muted block md:inline md:ml-2">(includes friez & 1 sauce)</span>
                        </div>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                        {MENU_ITEMS.filter(i => i.category === 'Beef Burgz').map(item => (
                            <Card key={item.id} className="bg-fb-surface/50 border-fb-surface-soft hover:bg-fb-surface transition-colors">
                                <CardHeader>
                                    <CardTitle className="text-xl text-fb-secondary">{item.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-fb-muted">{item.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Chix Burgz */}
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-fb-surface-soft pb-4">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-bold font-fbHeading text-fb-secondary uppercase tracking-wide">Chix Burgz</h2>
                        </div>
                        <div className="text-2xl font-bold text-fb-text bg-fb-surface px-4 py-2 rounded-lg border border-fb-surface-soft">
                            £8.50 <span className="text-sm font-normal text-fb-muted block md:inline md:ml-2">(includes friez & 1 sauce)</span>
                        </div>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                        {MENU_ITEMS.filter(i => i.category === 'Chix Burgz').map(item => (
                            <Card key={item.id} className="bg-fb-surface/50 border-fb-surface-soft hover:bg-fb-surface transition-colors">
                                <CardHeader>
                                    <CardTitle className="text-xl text-fb-primary">{item.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-fb-muted">{item.description}</p>
                                    {item.is_spicy && <Badge variant="destructive" className="mt-2">Spicy</Badge>}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Vegetarian Option */}
                <div className="bg-fb-success/10 border-2 border-fb-success/30 rounded-2xl p-8 text-center">
                    <h3 className="text-2xl font-bold text-fb-success uppercase font-fbHeading mb-2">Vegetarian Option</h3>
                    <p className="text-xl text-fb-text">Swap any meat for <span className="font-bold text-fb-success">Halloumi / “oumi” cheese</span> – £6.50</p>
                </div>

                {/* Add Inside / Meat Boost */}
                <div className="grid gap-8 md:grid-cols-2">
                    <div className="space-y-6">
                        <SectionHeader className="text-2xl">Add Inside Your Burger</SectionHeader>
                        <div className="bg-fb-surface rounded-xl p-6 border border-fb-surface-soft space-y-4">
                            {MENU_ITEMS.filter(i => i.category === 'Add Inside Your Burger').map(item => (
                                <div key={item.id} className="flex justify-between items-center border-b border-fb-surface-soft last:border-0 pb-3 last:pb-0">
                                    <div>
                                        <span className="font-bold text-fb-text">{item.name}</span>
                                        {item.description && <span className="block text-xs text-fb-muted">{item.description}</span>}
                                    </div>
                                    <span className="font-mono text-fb-secondary">£{item.price?.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-6">
                        <SectionHeader className="text-2xl">Add Into Your Box</SectionHeader>
                        <div className="bg-fb-surface rounded-xl p-6 border border-fb-surface-soft space-y-4">
                            {MENU_ITEMS.filter(i => i.category === 'Add Into Your Box').map(item => (
                                <div key={item.id} className="flex justify-between items-center border-b border-fb-surface-soft last:border-0 pb-3 last:pb-0">
                                    <span className="font-bold text-fb-text">{item.name}</span>
                                    <span className="font-mono text-fb-secondary">£{item.price?.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Desserts & Shakes */}
                <div className="grid gap-8 md:grid-cols-2">
                    <div className="space-y-6">
                        <SectionHeader className="text-fb-accent">Cheesecakez</SectionHeader>
                        <div className="grid gap-4">
                            {MENU_ITEMS.filter(i => i.category === 'Cheesecakez').map(item => (
                                <Card key={item.id} className="flex items-center justify-between p-4 bg-fb-surface/50">
                                    <span className="font-bold text-lg">{item.name}</span>
                                    <span className="font-bold text-fb-accent">£{item.price?.toFixed(2)}</span>
                                </Card>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-6">
                        <SectionHeader className="text-fb-accent">Milkshakez</SectionHeader>
                        <div className="grid gap-4">
                            {MENU_ITEMS.filter(i => i.category === 'Milkshakez').map(item => (
                                <Card key={item.id} className="flex items-center justify-between p-4 bg-fb-surface/50">
                                    <div>
                                        <span className="font-bold text-lg block">{item.name}</span>
                                        {item.description && <span className="text-xs text-fb-muted">{item.description}</span>}
                                    </div>
                                    <span className="font-bold text-fb-accent">£{item.price?.toFixed(2)}</span>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Extra Sauce */}
                <div className="space-y-6">
                    <SectionHeader>Extra Sauce</SectionHeader>
                    <div className="flex flex-wrap gap-4">
                        {MENU_ITEMS.filter(i => i.category === 'Extra Sauce').map(item => (
                            <Badge key={item.id} variant="outline" className="text-base py-2 px-4 border-fb-surface-soft hover:bg-fb-surface hover:border-fb-primary transition-colors cursor-default">
                                {item.name} <span className="ml-2 text-fb-primary font-bold">£{item.price?.toFixed(2)}</span>
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Breakfast Section */}
                <section id="breakfast" className="space-y-8 pt-12 border-t border-fb-surface-soft">
                    <div className="text-center">
                        <h2 className="text-5xl font-bold font-fbHeading text-fb-secondary uppercase tracking-wide mb-2">Breakfast Burgz!</h2>
                        <p className="text-xl text-fb-muted">CHOOSE YOUR BASE £4 • TOPPED WITH AMERICAN SLICES</p>
                    </div>
                    <div className="bg-fb-surface rounded-2xl p-8 border-2 border-fb-secondary/30 text-center max-w-2xl mx-auto">
                        <h3 className="text-2xl font-bold text-fb-text mb-4">Add Extra Toppings</h3>
                        <p className="text-4xl font-bold text-fb-secondary font-fbHeading">£1.50 EACH</p>
                        <p className="text-fb-muted mt-4">(See in-store for full selection)</p>
                    </div>
                </section>

                {/* Hot Drinks */}
                <div className="space-y-6">
                    <SectionHeader>Hot Drinks</SectionHeader>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {MENU_ITEMS.filter(i => i.category === 'Hot Drinks').map(item => (
                            <div key={item.id} className="flex justify-between items-center bg-fb-surface p-4 rounded-lg border border-fb-surface-soft">
                                <span className="font-bold">{item.name}</span>
                                <span className="text-fb-muted">£{item.price?.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Reviews & Socials */}
            <section className="bg-fb-surface py-16 mt-12">
                <div className="container px-4 text-center space-y-8">
                    <SectionHeader className="text-center mb-0">What People Say</SectionHeader>
                    <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
                        <Card className="bg-fb-bg border-fb-surface-soft">
                            <CardContent className="pt-6">
                                <div className="flex justify-center mb-4 text-fb-secondary">
                                    {[1, 2, 3, 4, 5].map(i => <span key={i} className="text-2xl">★</span>)}
                                </div>
                                <p className="text-lg italic text-fb-muted">"Best burgers in the North East. Hands down."</p>
                                <p className="mt-4 font-bold text-fb-text">- Google Review</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-fb-bg border-fb-surface-soft">
                            <CardContent className="pt-6">
                                <div className="flex justify-center mb-4 text-fb-secondary">
                                    {[1, 2, 3, 4, 5].map(i => <span key={i} className="text-2xl">★</span>)}
                                </div>
                                <p className="text-lg italic text-fb-muted">"That Biscoff shake changed my life."</p>
                                <p className="mt-4 font-bold text-fb-text">- Facebook Review</p>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="flex justify-center gap-4 pt-8">
                        <Button asChild variant="outline" size="lg">
                            <Link href="https://facebook.com" target="_blank">Facebook</Link>
                        </Button>
                        <Button asChild variant="outline" size="lg">
                            <Link href="https://instagram.com" target="_blank">Instagram</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Locations */}
            <section className="container px-4 md:px-6 pb-12">
                <SectionHeader className="text-center">Locations</SectionHeader>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {LOCATIONS.map((loc) => (
                        <Card key={loc.name} className="text-center hover:border-fb-primary transition-colors">
                            <CardHeader>
                                <CardTitle className="text-xl text-fb-primary">{loc.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-fb-text">{loc.address}</p>
                                <div className="text-sm text-fb-muted space-y-1">
                                    <p>12–9pm | Mon–Sat</p>
                                    <p>9–11am | Fri–Sat (Breakfast)</p>
                                    <p>2–9pm | Sun</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    )
}
