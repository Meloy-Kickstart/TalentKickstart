import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default function AdminStudentsPage() {
    return (
        <DashboardLayout user={null}>
            <div className="container mx-auto py-10">
                <h1 className="text-3xl font-bold mb-6 text-gradient">Student Administration</h1>
                <div className="glass-panel p-6 rounded-xl">
                    <p className="text-muted-foreground">Student management tools coming soon...</p>
                </div>
            </div>
        </DashboardLayout>
    )
}
