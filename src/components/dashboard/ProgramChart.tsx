'use client';

import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

// Fixed color map — each program gets a distinct, recognizable color
const colorMap: Record<string, string> = {
  'Runway Program': '#002D72',   // FGCU Navy
  'Veterans Florida': '#007749', // FGCU Green
  'DKSOE Students': '#B9975B',   // FGCU Gold
  'CEO Club': '#0E7490',         // Teal
  'ENT Classes': '#B45309',      // Amber
  'DMD Classes': '#7C3AED',      // Purple
};
const fallbackColor = '#94A3B8'; // Slate gray for any unlisted program

export default function ProgramChart({ data }: { data: Record<string, number> }) {
  const labels = Object.keys(data);
  const values = Object.values(data);
  const colors = labels.map((label) => colorMap[label] || fallbackColor);

  return (
    <Doughnut
      data={{
        labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderWidth: 0,
          hoverOffset: 6,
        }],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { padding: 12, usePointStyle: true, pointStyle: 'circle', font: { size: 10 } },
          },
        },
      }}
    />
  );
}
