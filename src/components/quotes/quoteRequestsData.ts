
// Sample quote requests data
// In a real app, this would come from an API or database
export const sampleQuoteRequests = [
  {
    id: 'quote-1',
    title: 'Weekly Produce Order',
    supplier: 'Farm Fresh Produce',
    status: 'pending',
    dueDate: new Date('2025-05-12'),
    fromChefRequest: true,
    chefName: 'Chef Michael',
    items: 8,
    category: 'Produce'
  },
  {
    id: 'quote-2',
    title: 'Monthly Meat Order',
    supplier: 'Premium Meats Inc.',
    status: 'sent',
    dueDate: new Date('2025-05-15'),
    fromChefRequest: false,
    items: 5,
    category: 'Meat'
  },
  {
    id: 'quote-3',
    title: 'Specialty Ingredients',
    supplier: 'Gourmet Suppliers',
    status: 'received',
    dueDate: new Date('2025-05-10'),
    fromChefRequest: true,
    chefName: 'Chef Sarah',
    items: 12,
    category: 'Specialty'
  },
  {
    id: 'quote-4',
    title: 'Kitchen Equipment',
    supplier: 'Restaurant Supply Co.',
    status: 'ordered',
    dueDate: new Date('2025-05-20'),
    fromChefRequest: false,
    items: 3,
    category: 'Equipment'
  }
];

export interface QuoteRequest {
  id: string;
  title: string;
  supplier: string;
  status: string;
  dueDate: Date;
  fromChefRequest: boolean;
  chefName?: string;
  items: number;
  category: string;
}
