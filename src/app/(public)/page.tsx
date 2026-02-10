import { Button } from "@/components/ui/button"
import { SectionHeader } from "@/components/ui/section-header"
import Link from "next/link"
import { MENU_ITEMS, LOCATIONS, CHICKEN_FLAVOURS } from "@/lib/data"
import { getActiveSpecials } from "@/app/actions/specials"
import { Badge } from "@/components/ui/badge"
import { MapPin } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function HomePage() {
    const activeSpecials = await getActiveSpecials()

    return (
        <div className="flex flex-col gap-20 pb-20 pt-12">

            {/* Condensed Seasonal Specials Hero */}
            <section className="container">
                <div className="bg-fb-surface-soft/30 rounded-[3rem] p-8 md:p-12 border-2 border-fb-surface-soft">
                    <SectionHeader className="text-center text-fb-primary mb-10">Mouth-Watering Specialz</SectionHeader>
                    <div className="grid gap-8 md:gap-6 grid-cols-1 md:grid-cols-3 max-w-6xl mx-auto items-center">
                        {/* Brownie Shake - Left */}
                        <div className="flex flex-col items-center text-center space-y-6 group order-1 md:order-1">
                            <div className="relative w-full max-w-xs aspect-square">
                                <img
                                    src="/brownie-milkshake.png"
                                    alt="THE BROWNIE SHAKE"
                                    className="w-full h-full object-contain drop-shadow-2xl transition-transform duration-300 group-hover:scale-110 -rotate-6"
                                />
                            </div>
                            <div>
                                <h3 className="text-2xl md:text-3xl font-black text-fb-text uppercase font-fbHeading leading-none mb-2">
                                    THE BROWNIE SHAKE
                                </h3>
                                <p className="text-base md:text-lg font-medium text-fb-muted max-w-sm leading-snug mx-auto uppercase">Fresh cream, Chocolate Sauce, And Brownie Chunkz</p>
                                <p className="text-2xl md:text-3xl font-black text-fb-primary font-fbHeading mt-4">
                                    £4.50 / £5.50
                                </p>
                            </div>
                        </div>

                        {/* Truffle Burger - Center with circular clipping mask */}
                        <div className="flex flex-col items-center text-center space-y-6 group order-2 md:order-2">
                            <div className="relative w-full max-w-sm aspect-square flex items-center justify-center">
                                {/* Circular border container */}
                                <div className="w-[85%] aspect-square rounded-full border-4 border-fb-primary bg-white overflow-hidden shadow-2xl">
                                    <img
                                        src="/Truffle-Prm-and-Pepper-Ranch-.png"
                                        alt="TRUFFLE PRM & PEPPER RANCH"
                                        className="w-full h-full object-cover scale-125 transition-transform duration-300 group-hover:scale-150"
                                    />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-2xl md:text-3xl font-black text-fb-text uppercase font-fbHeading leading-none mb-2">
                                    TRUFFLE PARM & PEPPER RANCH
                                </h3>
                                <p className="text-base md:text-lg font-medium text-fb-muted max-w-sm leading-snug mx-auto uppercase">2x Smash beef patty, truffle parmesan, pepper ranch sauce, crispy onions, Bacon</p>
                                <p className="text-2xl md:text-3xl font-black text-fb-primary font-fbHeading mt-4">
                                    £13.50
                                </p>
                            </div>
                        </div>

                        {/* Dubai Shake - Right */}
                        <div className="flex flex-col items-center text-center space-y-6 group order-3 md:order-3">
                            <div className="relative w-full max-w-xs aspect-square">
                                <img
                                    src="/Dubai-Shake-NEW.png"
                                    alt="THE DUBAI SHAKE"
                                    className="w-full h-full object-contain drop-shadow-2xl transition-transform duration-300 group-hover:scale-110 rotate-6"
                                />
                            </div>
                            <div>
                                <h3 className="text-2xl md:text-3xl font-black text-fb-text uppercase font-fbHeading leading-none mb-2">
                                    THE DUBAI SHAKE
                                </h3>
                                <p className="text-base md:text-lg font-medium text-fb-muted max-w-sm leading-snug mx-auto uppercase">Fresh cream, Pistachio, Kataifi pastry, Chocolate sauce</p>
                                <p className="text-2xl md:text-3xl font-black text-fb-primary font-fbHeading mt-4">
                                    £4.50 / £5.50
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Dynamic Specials Section */}
            {activeSpecials.length > 0 && (
                <section className="container">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 mb-6 border-b-2 border-fb-surface-soft">
                        <h2 className="text-4xl md:text-6xl font-black font-fbHeading text-fb-primary uppercase tracking-wide">Live Specialz</h2>
                        <div className="animate-pulse flex items-center gap-2 bg-fb-primary/10 px-4 py-2 rounded-full self-start md:self-auto">
                            <div className="w-3 h-3 bg-fb-secondary rounded-full"></div>
                            <span className="font-bold text-fb-secondary uppercase tracking-wider text-xs md:text-sm">Limited Time Only</span>
                        </div>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {activeSpecials.map((special) => (
                            <div key={special.id} className="group relative bg-white border-2 border-fb-secondary rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] flex flex-col">
                                <div className="absolute -top-4 right-6">
                                    <Badge className="bg-fb-secondary text-white hover:bg-fb-secondary text-lg px-4 py-1 uppercase font-black tracking-wide border-0 shadow-md">
                                        Special
                                    </Badge>
                                </div>
                                <div className="mb-4">
                                    <h3 className="text-3xl font-black text-fb-text font-fbHeading uppercase leading-none mb-2">{special.title}</h3>
                                    <p className="text-lg font-bold text-fb-muted uppercase tracking-wide">{special.subtitle}</p>
                                </div>
                                <div className="flex-grow">
                                    <p className="text-fb-text font-medium leading-relaxed">{special.description}</p>
                                </div>
                                <div className="mt-6 flex items-center justify-between border-t-2 border-fb-surface-soft pt-4">
                                    <span className="text-3xl font-black text-fb-primary font-fbHeading">£{special.price?.toFixed(2)}</span>
                                    <span className="text-sm font-bold text-fb-muted uppercase">Available Now</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <div className="container space-y-24">
                {/* Beef Burgz */}
                <section>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 mb-8">
                        <div>
                            <h2 className="text-4xl md:text-6xl font-black font-fbHeading text-fb-primary uppercase tracking-wide">Beef Burgz</h2>
                        </div>
                        <div className="text-xl md:text-3xl font-bold text-fb-primary px-4 md:px-6 py-2 md:py-3 rounded-xl transform -rotate-1 border-2 border-fb-primary self-start md:self-auto">
                            £8.50 <span className="text-sm md:text-lg font-normal text-fb-primary/90 block md:inline md:ml-2">(+ friez & 1 sauce)</span>
                        </div>
                    </div>
                    <div className="grid gap-x-12 gap-y-6 md:grid-cols-2">
                        {MENU_ITEMS.filter(i => i.category === 'Beef Burgz').map(item => (
                            <div key={item.id} className="flex flex-col gap-1 border-b border-fb-surface-soft pb-4">
                                <h3 className="text-2xl font-black text-fb-text uppercase">{item.name}</h3>
                                <p className="text-fb-muted font-bold text-lg leading-tight">{item.description}</p>
                                {item.is_spicy && <span className="text-fb-primary font-black uppercase text-sm mt-1">Spicy</span>}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Chix Burgz */}
                <section>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 mb-8">
                        <div>
                            <h2 className="text-4xl md:text-6xl font-black font-fbHeading text-fb-primary uppercase tracking-wide">Chix Burgz</h2>
                        </div>
                        <div className="text-xl md:text-3xl font-bold text-fb-text bg-fb-surface px-4 md:px-6 py-2 md:py-3 rounded-xl transform rotate-1 self-start md:self-auto">
                            £8.50 <span className="text-sm md:text-lg font-normal text-fb-text/80 block md:inline md:ml-2">(+ friez & 1 sauce)</span>
                        </div>
                    </div>
                    <div className="grid gap-x-12 gap-y-6 md:grid-cols-2">
                        {MENU_ITEMS.filter(i => i.category === 'Chix Burgz').map(item => (
                            <div key={item.id} className="flex flex-col gap-1 border-b border-fb-surface-soft pb-4">
                                <h3 className="text-2xl font-black text-fb-text uppercase">{item.name}</h3>
                                <p className="text-fb-muted font-bold text-lg leading-tight">{item.description}</p>
                                {item.is_spicy && <span className="text-fb-primary font-black uppercase text-sm mt-1">Spicy</span>}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Upgrades Grid */}
                <section className="grid md:grid-cols-2 gap-12">
                    {/* Add Inside */}
                    <div>
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 mb-8">
                            <h2 className="text-3xl md:text-5xl font-black font-fbHeading text-fb-primary uppercase tracking-wide">Add Inside</h2>
                        </div>
                        <div className="space-y-4">
                            {MENU_ITEMS.filter(i => i.category === 'Add Inside Your Burger').map(item => (
                                <div key={item.id} className="flex justify-between items-center border-b border-fb-surface-soft pb-3 last:border-0">
                                    <span className="font-bold text-xl text-fb-text">{item.name}</span>
                                    <span className="font-black text-fb-primary text-2xl">£{item.price?.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Vegetarian/Upgrade Box - Simplified */}
                    <div>
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 mb-8">
                            <h2 className="text-3xl md:text-5xl font-black font-fbHeading text-fb-primary uppercase tracking-wide">Vegetarian</h2>
                        </div>
                        <div className="bg-fb-surface-soft/50 text-fb-text rounded-3xl p-8 flex flex-col justify-center text-center border-2 border-transparent">
                            <p className="text-2xl font-bold mb-2">Swap any beef with</p>
                            <span className="text-fb-primary font-black font-fbHeading text-4xl mb-4 block">Oumi Cheeze</span>
                            <div className="w-16 h-1 bg-fb-text mx-auto mb-4"></div>
                            <p className="text-5xl font-black">£6.50</p>
                        </div>
                    </div>
                </section>

                {/* Sides & Chicken Section */}
                <section>
                    <SectionHeader className="text-fb-primary pl-4 border-l-8 border-fb-primary mb-12">Sides & Chicken</SectionHeader>

                    {/* Vertical Stack Layout */}
                    <div className="space-y-16">

                        {/* Chix Bitez */}
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 mb-2">
                                <h3 className="text-3xl md:text-5xl font-black uppercase text-fb-primary font-fbHeading">Chix Bitez</h3>
                            </div>
                            <div className="space-y-4">
                                {MENU_ITEMS.filter(i => i.category === 'Sides' && i.name.includes('Chix Bitez')).map(item => (
                                    <div key={item.id} className="flex flex-col gap-1 border-b border-fb-surface-soft last:border-0 pb-3">
                                        <div className="flex justify-between items-baseline">
                                            <span className="text-2xl font-bold text-fb-text leading-tight">{item.name.replace('Chix Bitez ', '')}</span>
                                            <span className="text-2xl font-black text-fb-primary whitespace-nowrap ml-2">£{item.price?.toFixed(2)}</span>
                                        </div>
                                        {item.description && <span className="text-lg text-fb-muted font-bold">{item.description}</span>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Filletz */}
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 mb-2">
                                <h3 className="text-3xl md:text-5xl font-black uppercase text-fb-primary font-fbHeading">Filletz</h3>
                            </div>
                            <div className="space-y-4">
                                {MENU_ITEMS.filter(i => i.category === 'Sides' && i.name.includes('Filletz')).map(item => (
                                    <div key={item.id} className="flex flex-col gap-1 border-b border-fb-surface-soft last:border-0 pb-3">
                                        <div className="flex justify-between items-baseline">
                                            <span className="text-2xl font-bold text-fb-text leading-tight">{item.name.replace('Filletz ', '')}</span>
                                            <span className="text-2xl font-black text-fb-primary whitespace-nowrap ml-2">£{item.price?.toFixed(2)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Oumi Cheeze */}
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 mb-2">
                                <h3 className="text-3xl md:text-5xl font-black uppercase text-fb-primary font-fbHeading">Oumi Cheeze</h3>
                            </div>
                            <div className="space-y-4">
                                {MENU_ITEMS.filter(i => i.category === 'Sides' && i.name.includes('Oumi Cheeze')).map(item => (
                                    <div key={item.id} className="flex flex-col gap-1 border-b border-fb-surface-soft last:border-0 pb-3">
                                        <div className="flex justify-between items-baseline">
                                            <span className="text-2xl font-bold text-fb-text leading-tight">{item.name.replace('Oumi Cheeze ', '')}</span>
                                            <span className="text-2xl font-black text-fb-primary whitespace-nowrap ml-2">£{item.price?.toFixed(2)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Flavours Panel - Clean Refactor */}
                        <div className="space-y-8 pt-8 border-t-4 border-fb-surface-soft">
                            <h3 className="text-4xl md:text-5xl font-black uppercase text-fb-text font-fbHeading">Choose Your Flavour</h3>

                            <div className="grid md:grid-cols-2 gap-12">
                                <div>
                                    <h4 className="font-black text-2xl mb-6 text-fb-primary border-b-2 border-fb-surface-soft pb-2">SAUCY</h4>
                                    <ul className="space-y-3 font-bold text-xl text-fb-text">
                                        {CHICKEN_FLAVOURS.saucy.map(f => (
                                            <li key={f} className="flex items-center gap-3">
                                                <span className="w-3 h-3 rounded-full bg-fb-primary"></span>
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-black text-2xl mb-6 text-fb-secondary border-b-2 border-fb-surface-soft pb-2">DRY</h4>
                                    <ul className="space-y-3 font-bold text-xl text-fb-text">
                                        {CHICKEN_FLAVOURS.dry.map(f => (
                                            <li key={f} className="flex items-center gap-3">
                                                <span className="w-3 h-3 rounded-full bg-fb-secondary"></span>
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                    </div>
                </section>

                {/* Friez Section */}
                <section>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 mb-8">
                        <div>
                            <h2 className="text-4xl md:text-6xl font-black font-fbHeading text-fb-primary uppercase tracking-wide">Friez</h2>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-12">
                        {/* The Friez - No Card */}
                        <div>
                            <h3 className="text-3xl font-black uppercase mb-6 text-fb-primary font-fbHeading border-b-2 border-fb-surface-soft pb-2">The Friez</h3>
                            <div className="space-y-4">
                                {MENU_ITEMS.filter(i => i.category === 'Friez').map(item => (
                                    <div key={item.id} className="flex justify-between items-center border-b border-fb-surface-soft pb-3 last:border-0">
                                        <span className="text-xl font-bold uppercase">{item.name}</span>
                                        <span className="text-2xl font-black text-fb-primary">£{item.price?.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Add To Box - No Card */}
                        <div>
                            <h3 className="text-3xl font-black uppercase mb-6 text-fb-primary font-fbHeading border-b-2 border-fb-surface-soft pb-2">Add To Box</h3>
                            <div className="space-y-4">
                                {MENU_ITEMS.filter(i => i.category === 'Add Into Your Box').map(item => (
                                    <div key={item.id} className="flex justify-between items-center border-b border-fb-surface-soft pb-3 last:border-0">
                                        <span className="text-xl font-bold uppercase">{item.name}</span>
                                        <span className="text-2xl font-black text-fb-primary">£{item.price?.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Kidz Menu - Standardized Style */}
                <section>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 mb-12 border-b-8 border-fb-primary/20">
                        <div>
                            <h2 className="text-4xl md:text-6xl font-black font-fbHeading text-fb-primary uppercase tracking-wide">Kidz Menu</h2>
                            <p className="text-lg md:text-xl font-bold text-fb-muted mt-2 uppercase tracking-widest">Includes Friez</p>
                        </div>
                        <div className="text-4xl md:text-5xl font-black text-fb-primary font-fbHeading">
                            £6.00
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-6">
                        {[
                            { name: "Single Beef", icon: "🍔" },
                            { name: "Chicken Bitez", icon: "🍗" },
                            { name: "Filletz", icon: "🍗" },
                            { name: "Oumi Cheeze", icon: "🧀" }
                        ].map((item) => (
                            <div key={item.name} className="flex justify-between items-center border-b border-fb-surface-soft pb-4">
                                <span className="text-2xl font-black uppercase text-fb-text font-fbHeading">{item.name}</span>
                                {/* Icon removed or kept minimal? Keeping minimal as per 'clean' request, maybe just text list or small icon */}
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <SectionHeader>Dessertz</SectionHeader>
                    <div className="grid gap-12 md:grid-cols-2 items-start">
                        {/* Cheesecakes - Clean List */}
                        <div>
                            <div className="flex flex-wrap justify-between items-end mb-8 border-b-2 border-fb-text pb-2 gap-2">
                                <h3 className="text-3xl md:text-4xl font-black font-fbHeading text-fb-primary">Cheesecakez</h3>
                                <span className="text-2xl md:text-3xl font-bold text-fb-primary">£4.50</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {MENU_ITEMS.filter(i => i.category === 'Cheesecakez').map(item => (
                                    <div key={item.id} className="text-center font-bold uppercase text-xl py-3 border-b border-fb-surface-soft text-fb-text">
                                        {item.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Milkshakes - Clean List */}
                        <div>
                            <div className="flex flex-wrap justify-between items-end mb-8 border-b-2 border-fb-text pb-2 gap-2">
                                <h3 className="text-3xl md:text-4xl font-black font-fbHeading text-fb-primary">Milkshakez</h3>
                                <div className="text-right leading-none">
                                    <span className="block text-xs md:text-sm font-bold text-fb-muted mb-1">REG / LRG</span>
                                    <span className="text-2xl md:text-3xl font-bold text-fb-primary">3.50 / 4.50</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {MENU_ITEMS.filter(i => i.category === 'Milkshakez' && !i.name.includes('Special')).map(item => (
                                    <div key={item.id} className="text-center font-bold uppercase text-xl py-3 border-b border-fb-surface-soft text-fb-text">
                                        {item.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </section>

                {/* Breakfast (Original - Preserving mostly but matching clean style) */}
                <section id="breakfast" className="space-y-12 pt-12 border-t-8 border-fb-surface-soft">
                    <div className="text-center space-y-4">
                        <span className="inline-block bg-fb-secondary text-white font-bold px-4 py-1 rounded-full text-sm uppercase tracking-widest mb-2">Morning Special</span>
                        <h2 className="text-6xl md:text-7xl font-black font-fbHeading text-fb-primary uppercase tracking-tight">Breakfast Burgz!</h2>
                        <p className="text-xl md:text-2xl text-fb-text font-bold max-w-2xl mx-auto border-y-2 border-fb-surface-soft py-4">CHOOSE YOUR BASE £4 • TOPPED WITH AMERICAN SLICES</p>
                    </div>
                    <div className="bg-fb-surface-soft/30 p-10 rounded-[3rem] text-center max-w-3xl mx-auto">
                        <h3 className="text-3xl font-bold text-fb-primary mb-2">Add Extra Toppings</h3>
                        <p className="text-7xl font-black text-fb-secondary font-fbHeading mb-4">£1.50 <span className="text-3xl font-bold text-fb-muted">EACH</span></p>
                        <p className="text-fb-muted font-bold text-lg font-mono">(See in-store for full selection)</p>
                    </div>
                    <div className="space-y-8">
                        <SectionHeader className="text-center">Hot Drinks</SectionHeader>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                            {MENU_ITEMS.filter(i => i.category === 'Hot Drinks').map(item => (
                                <div key={item.id} className="flex justify-between items-center p-6 border-b-2 border-fb-surface-soft">
                                    <span className="font-bold text-lg">{item.name}</span>
                                    <span className="text-fb-muted font-bold text-lg">£{item.price?.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Locations */}
                <section className="pb-20 pt-12 text-center">
                    <SectionHeader className="text-center mb-16">Locations</SectionHeader>
                    <div className="flex flex-wrap justify-center gap-12">
                        {LOCATIONS.map((loc, idx) => (
                            <div
                                key={loc.name}
                                className={`flex flex-col gap-6 group w-full md:w-[calc(50%-1.5rem)] lg:w-[calc(33.333%-2rem)] ${idx >= 3 ? 'lg:w-[calc(33.333%-2rem)]' : ''}`}
                            >
                                <h3 className="text-3xl text-fb-primary font-black uppercase tracking-wide group-hover:scale-105 transition-transform">{loc.name}</h3>
                                <div className="space-y-4 p-6 h-full transition-all">
                                    <p className="text-fb-text font-bold text-xl leading-snug">{loc.address}</p>
                                    <MapPin className="w-8 h-8 mx-auto text-fb-primary/80" />
                                    <div className="text-sm text-fb-muted space-y-2 font-bold font-mono">
                                        {loc.times.split(' | ').map((time, idx) => (
                                            <p key={idx}>{time}</p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    )
}
