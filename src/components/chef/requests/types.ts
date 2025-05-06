
export interface RequestItem {
  id: string;
  name: string;
  quantity: number | string;
  unit: string;
  stockStatus?: string;
  stockValue?: string | number;
}

export interface Request {
  id: string;
  title: string;
  status: string;
  dueDate: Date;
  deliveryDate?: Date;
  category: string;
  items: RequestItem[];
  notes?: string;
}

export interface RequestTabData {
  id: string;
  label: string;
}
