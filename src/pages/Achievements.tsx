import React from 'react';
import { useAuth } from '@/hooks/useAuthContext';
import { AchievementsDisplay } from '@/components/AchievementsDisplay';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Loader2 } from 'lucide-react';

const AchievementsPage = () => {
  const { user, isLoading: loading } = useAuth();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Please log in to view your achievements.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container max-w-5xl mx-auto py-8 px-4">
        <AchievementsDisplay userId={user.id} />
      </div>
    </DashboardLayout>
  );
};

export default AchievementsPage;
