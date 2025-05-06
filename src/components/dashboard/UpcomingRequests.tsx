
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';

export function UpcomingRequests() {
  const today = new Date();
  
  // Sample upcoming quote request dates
  const upcomingDates = [
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3),
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7),
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14),
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + 21),
  ];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Requests</CardTitle>
        <CardDescription>Schedule of upcoming quote requests</CardDescription>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          disabled={{ before: new Date() }}
          modifiers={{ upcoming: upcomingDates }}
          modifiersStyles={{
            upcoming: { backgroundColor: '#f0f9ff', borderRadius: '0', color: '#1e40af', fontWeight: 'bold' }
          }}
          className="rounded-md border"
        />
        
        <div className="mt-4 space-y-2">
          {upcomingDates.map((date, i) => (
            <div key={i} className="flex items-center justify-between p-2 border-l-4 border-navy rounded bg-light-gray">
              <div>
                <div className="font-medium">{date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                <div className="text-xs text-muted-foreground">
                  {i === 0 ? 'Weekly produce order' : 
                   i === 1 ? 'Monthly dairy order' : 
                   i === 2 ? 'Weekly produce order' : 'Monthly meat order'}
                </div>
              </div>
              <div className="text-xs font-medium text-dark-gray">
                {Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))} days
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
