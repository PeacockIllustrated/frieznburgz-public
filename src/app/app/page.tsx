import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { SectionHeader } from "@/components/ui/section-header"

export default function AdminHomePage() {
    return (
        <div className="space-y-8">
            <SectionHeader>Dashboard</SectionHeader>
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Manage Specials</CardTitle>
                        <CardDescription>Update active specials, prices, and descriptions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full">
                            <Link href="/app/specials">View Specials</Link>
                        </Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Recruitment</CardTitle>
                        <CardDescription>View applications from potential candidates.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild variant="secondary" className="w-full">
                            <Link href="/app/recruitment">View Applications</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
