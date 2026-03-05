'use client';

import dynamic from 'next/dynamic';

const ProgramChart = dynamic(() => import('@/components/dashboard/ProgramChart'), { ssr: false });
const DomainChart = dynamic(() => import('@/components/dashboard/DomainChart'), { ssr: false });
const SectorChart = dynamic(() => import('@/components/dashboard/SectorChart'), { ssr: false });

interface DashboardChartsProps {
  programs: Record<string, number>;
  domains: Record<string, number>;
  sectors: Record<string, number>;
}

export default function DashboardCharts({ programs, domains, sectors }: DashboardChartsProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 sm:-mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-6 shadow-lg fade-in">
          <h3 className="text-sm font-bold text-fgcu-blue uppercase tracking-wider mb-4">
            Mentors by Program
          </h3>
          <div className="relative" style={{ height: 260 }}>
            <ProgramChart data={programs} />
          </div>
        </div>
        <div className="glass-card rounded-2xl p-6 shadow-lg fade-in">
          <h3 className="text-sm font-bold text-fgcu-blue uppercase tracking-wider mb-4">
            Domain Expertise
          </h3>
          <div className="relative" style={{ height: 260 }}>
            <DomainChart data={domains} />
          </div>
        </div>
        <div className="glass-card rounded-2xl p-6 shadow-lg fade-in">
          <h3 className="text-sm font-bold text-fgcu-blue uppercase tracking-wider mb-4">
            Sector Coverage
          </h3>
          <div className="relative" style={{ height: 260 }}>
            <SectorChart data={sectors} />
          </div>
        </div>
      </div>
    </div>
  );
}
