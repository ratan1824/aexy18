import { DashboardHeader } from '@/components/dashboard/header';
import { ScenarioGrid } from '@/components/dashboard/scenario-grid';
import { getMockUser, scenarios } from '@/lib/data';

export default function DashboardPage() {
  // In a real app, this would come from auth.
  const user = getMockUser('1');

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <DashboardHeader user={user} />
        <section>
          <h2 className="text-2xl font-bold font-headline mb-4 text-foreground">Practice Scenarios</h2>
          <ScenarioGrid scenarios={scenarios} user={user} />
        </section>
      </main>
    </div>
  );
}
