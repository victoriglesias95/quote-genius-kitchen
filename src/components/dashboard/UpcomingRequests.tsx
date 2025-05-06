
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UpcomingRequest {
  date: Date;
  title: string;
  daysRemaining: number;
}

export function UpcomingRequests() {
  const [upcomingDates, setUpcomingDates] = useState<Date[]>([]);
  const [upcomingRequests, setUpcomingRequests] = useState<UpcomingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  useEffect(() => {
    async function fetchUpcomingRequests() {
      try {
        // Get requests that are due in the future
        const { data: requests, error } = await supabase
          .from('requests')
          .select('id, title, due_date')
          .gte('due_date', today.toISOString())
          .order('due_date', { ascending: true })
          .limit(5);
          
        if (error) {
          throw error;
        }
        
        if (requests && requests.length > 0) {
          // Extract dates for calendar highlights
          const dates = requests.map(req => new Date(req.due_date));
          setUpcomingDates(dates);
          
          // Create formatted upcoming requests
          const formattedRequests = requests.map(req => {
            const dueDate = new Date(req.due_date);
            const diffTime = dueDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            return {
              date: dueDate,
              title: req.title,
              daysRemaining: diffDays
            };
          });
          
          setUpcomingRequests(formattedRequests);
        } else {
          // If no requests, use sample data
          generateSampleData();
        }
      } catch (error) {
        console.error('Error fetching upcoming requests:', error);
        toast.error('Failed to load upcoming requests');
        
        // Use sample data on error
        generateSampleData();
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchUpcomingRequests();
  }, []);
  
  // Generate sample data if no real data is available
  const generateSampleData = () => {
    const sampleDates = [
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3),
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7),
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14),
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 21),
    ];
    
    const sampleRequests = [
      { date: sampleDates[0], title: 'Weekly produce order', daysRemaining: 3 },
      { date: sampleDates[1], title: 'Monthly dairy order', daysRemaining: 7 },
      { date: sampleDates[2], title: 'Weekly produce order', daysRemaining: 14 },
      { date: sampleDates[3], title: 'Monthly meat order', daysRemaining: 21 },
    ];
    
    setUpcomingDates(sampleDates);
    setUpcomingRequests(sampleRequests);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Requests</CardTitle>
        <CardDescription>Schedule of upcoming quote requests</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <div className="animate-pulse bg-gray-200 h-48 w-full rounded mb-4"></div>
            <div className="animate-pulse bg-gray-200 h-12 w-full rounded"></div>
            <div className="animate-pulse bg-gray-200 h-12 w-full rounded"></div>
            <div className="animate-pulse bg-gray-200 h-12 w-full rounded"></div>
          </div>
        ) : (
          <>
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
              {upcomingRequests.map((request, i) => (
                <div key={i} className="flex items-center justify-between p-2 border-l-4 border-navy rounded bg-light-gray">
                  <div>
                    <div className="font-medium">
                      {request.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                    <div className="text-xs text-muted-foreground">{request.title}</div>
                  </div>
                  <div className="text-xs font-medium text-dark-gray">
                    {request.daysRemaining} days
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
