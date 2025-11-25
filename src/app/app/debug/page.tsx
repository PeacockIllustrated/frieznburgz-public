import { getSpecials } from "@/app/actions/specials"

export const dynamic = 'force-dynamic'

export default async function DebugPage() {
    try {
        const specials = await getSpecials()
        return (
            <div className="p-8 space-y-4">
                <h1 className="text-2xl font-bold">Debug Specials</h1>
                <pre className="bg-gray-900 text-white p-4 rounded overflow-auto text-xs">
                    {JSON.stringify(specials, null, 2)}
                </pre>
            </div>
        )
    } catch (error: any) {
        return (
            <div className="p-8 space-y-4">
                <h1 className="text-2xl font-bold text-red-500">Error Fetching Specials</h1>
                <pre className="bg-red-100 text-red-900 p-4 rounded">
                    {error.message}
                    {JSON.stringify(error, null, 2)}
                </pre>
            </div>
        )
    }
}
