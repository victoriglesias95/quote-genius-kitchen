
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const data = [
  { name: 'Jan', received: 12, sent: 18 },
  { name: 'Feb', received: 14, sent: 20 },
  { name: 'Mar', received: 16, sent: 16 },
  { name: 'Apr', received: 12, sent: 17 },
  { name: 'May', received: 15, sent: 21 },
  { name: 'Jun', received: 13, sent: 19 },
];

export function QuoteMetrics() {
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Quote Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                contentStyle={{ backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
                formatter={(value, name) => [value, name === 'received' ? 'Received Quotes' : 'Sent Requests']}
              />
              <Bar dataKey="sent" name="Sent Requests" fill="#1a365d" radius={[4, 4, 0, 0]} />
              <Bar dataKey="received" name="Received Quotes" fill="#c05621" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
