
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

export function QuoteMetrics() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchQuoteMetrics() {
      try {
        // Get the current date
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        // Create an array for the last 6 months
        const monthsData = [];
        
        for (let i = 5; i >= 0; i--) {
          const month = new Date(currentYear, currentMonth - i, 1);
          const monthName = month.toLocaleString('default', { month: 'short' });
          
          // Start of month
          const startDate = new Date(month.getFullYear(), month.getMonth(), 1).toISOString();
          // End of month
          const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0).toISOString();
          
          // Get quotes received in this month range
          const { count: receivedCount, error: receivedError } = await supabase
            .from('quotes')
            .select('*', { count: 'exact', head: true })
            .gte('submitted_date', startDate)
            .lt('submitted_date', endDate);
            
          if (receivedError) {
            console.error('Error fetching received quotes:', receivedError);
            continue;
          }
          
          // Get quote requests sent in this month range
          const { count: sentCount, error: sentError } = await supabase
            .from('requests')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', startDate)
            .lt('created_at', endDate);
            
          if (sentError) {
            console.error('Error fetching sent requests:', sentError);
            continue;
          }
          
          monthsData.push({
            name: monthName,
            received: receivedCount || 0,
            sent: sentCount || 0
          });
        }
        
        setData(monthsData);
      } catch (error) {
        console.error('Error fetching quote metrics:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchQuoteMetrics();
  }, []);

  // Sample data for fallback
  const sampleData = [
    { name: 'Jan', received: 12, sent: 18 },
    { name: 'Feb', received: 14, sent: 20 },
    { name: 'Mar', received: 16, sent: 16 },
    { name: 'Apr', received: 12, sent: 17 },
    { name: 'May', received: 15, sent: 21 },
    { name: 'Jun', received: 13, sent: 19 },
  ];

  // Use actual data if available, otherwise use sample data
  const chartData = data.length > 0 ? data : sampleData;

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Quote Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="animate-pulse bg-gray-200 h-4/5 w-4/5 rounded"></div>
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
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
        )}
      </CardContent>
    </Card>
  );
}
