export interface DashboardResponseDto {
  totals: {
    companies: number;
    contacts: number;
    leads: number;
    openLeads: number;
    wonLeads: number;
    activities: number;
    proposals: number;
    acceptedProposals: number;
  };
  pipeline: Array<{
    id: string;
    name: string;
    order: number;
    color: string | null;
    _count: { leads: number };
  }>;
  recentLeads: any[];
  upcomingActivities: any[];
}
