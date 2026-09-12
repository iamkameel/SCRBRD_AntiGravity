'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { ChartContainer, ChartLegendContent } from '@/components/ui/chart';

export interface PartnershipChartDataItem {
  wicketOrdinal: string;
  batsman1Name: string;
  batsman2Name: string;
  partnershipRuns: number;
  // These are total runs for the batsmen at the point the partnership ended or innings ended
  batsman1TotalRunsAtWicket: number;
  batsman2TotalRunsAtWicket: number;
}

const chartConfig = {
  partnershipRuns: { label: 'Partnership Runs', color: 'hsl(var(--chart-1))' },
};

const PartnershipTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const partnershipData = payload[0].payload as PartnershipChartDataItem;
    let partnerDisplay = '';
    if (partnershipData.batsman1Name && partnershipData.batsman1Name !== 'N/A' && partnershipData.batsman1Name !== 'Partner') {
      partnerDisplay += partnershipData.batsman1Name;
    }
    if (partnershipData.batsman2Name && partnershipData.batsman2Name !== 'N/A' && partnershipData.batsman2Name !== 'Partner') {
      if (partnerDisplay && partnershipData.batsman1Name !== partnershipData.batsman2Name) partnerDisplay += ' & ';
      else if (!partnerDisplay) partnerDisplay += partnershipData.batsman2Name;

      if (partnershipData.batsman1Name !== partnershipData.batsman2Name) {
        partnerDisplay += partnershipData.batsman2Name;
      } else if (!partnerDisplay) {
        partnerDisplay = partnershipData.batsman1Name;
      }
    }
    if (!partnerDisplay) partnerDisplay = 'Partnership';

    return (
      <div className="bg-card text-card-foreground p-3 rounded-md shadow-md border">
        <p className="font-semibold mb-1">{label}</p>
        <p>{partnerDisplay}</p>
        <p>Partnership Total: {partnershipData.partnershipRuns} runs</p>
      </div>
    );
  }
  return null;
};

export function PartnershipChart({ data }: { data: PartnershipChartDataItem[] }) {
  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full aspect-auto">
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 5, right: 40, left: 30, bottom: 20 }}
        barCategoryGap="25%"
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} />
        <YAxis dataKey="wicketOrdinal" type="category" width={120} interval={0} tick={{ fontSize: 12, dy: 5 }} />
        <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
        <RechartsTooltip content={<PartnershipTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
        <Legend content={<ChartLegendContent />} verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: '20px' }} />
        <Bar dataKey="partnershipRuns" name="Runs" fill="var(--color-partnershipRuns)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
