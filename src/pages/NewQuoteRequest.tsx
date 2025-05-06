
import React from 'react';
import { QuoteForm } from '@/components/quotes/QuoteForm';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar, SidebarToggle } from '@/components/layout/Sidebar';

const NewQuoteRequest = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1">
          <SidebarToggle />
          <div className="p-6 md:p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-navy">New Quote Request</h1>
              <p className="text-dark-gray">Create a new quote request for your suppliers</p>
            </div>
            <QuoteForm />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default NewQuoteRequest;
