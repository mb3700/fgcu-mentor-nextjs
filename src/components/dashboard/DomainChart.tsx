'use client';

import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export default function DomainChart({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data).slice(0, 10);

  return (
    <Bar
      data={{
        labels: entries.map(([k]) => k),
        datasets: [{
          data: entries.map(([, v]) => v),
          backgroundColor: '#002D7220',
          borderColor: '#002D72',
          borderWidth: 1.5,
          borderRadius: 6,
        }],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { stepSize: 1 } },
          y: { grid: { display: false }, ticks: { font: { size: 10 } } },
        },
      }}
    />
  );
}
