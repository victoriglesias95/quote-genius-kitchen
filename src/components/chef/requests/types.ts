
export interface RequestItem {
  id: string;
  name: string;
  quantity: number | string;
  unit: string;
  stockStatus?: string;
  stockValue?: string | number;
  supplierId?: string;
  supplierName?: string;
  price?: number;
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
  assignedTo?: string;
  quoteDeadline?: Date;
  reminderSent?: boolean;
  feedback?: {
    rating: number;
    comments: string;
    submittedBy: string;
    submittedDate: Date;
  };
  quotes?: {
    supplierId: string;
    supplierName: string;
    items: {
      itemId: string;
      price: number;
      quantity: number | string;
      notes?: string;
    }[];
    totalPrice: number;
    deliveryDate: Date;
    submittedDate: Date;
  }[];
  selectedQuote?: string; // ID of the selected quote
  purchaseOrderId?: string; // Reference to purchase order when created
  purchaseOrderStatus?: string; // Status of the purchase order
}

export interface RequestTabData {
  id: string;
  label: string;
}

export type UserRole = 'chef' | 'purchasing' | 'receiver' | 'admin' | null;

export interface UserPermissions {
  canCreateRequest: boolean;
  canApproveRequest: boolean;
  canSubmitQuote: boolean;
  canPlaceOrder: boolean;
  canReceiveOrder: boolean;
  canViewAnalytics: boolean;
  canManageUsers?: boolean;
}

// Define role permissions
export const getRolePermissions = (role: UserRole): UserPermissions => {
  switch (role) {
    case 'chef':
      return {
        canCreateRequest: true,
        canApproveRequest: false,
        canSubmitQuote: false,
        canPlaceOrder: false,
        canReceiveOrder: true,
        canViewAnalytics: true,
      };
    case 'purchasing':
      return {
        canCreateRequest: false,
        canApproveRequest: true,
        canSubmitQuote: false,
        canPlaceOrder: true,
        canReceiveOrder: false,
        canViewAnalytics: true,
      };
    case 'receiver':
      return {
        canCreateRequest: false,
        canApproveRequest: false,
        canSubmitQuote: false,
        canPlaceOrder: false,
        canReceiveOrder: true,
        canViewAnalytics: false,
      };
    case 'admin':
      return {
        canCreateRequest: true,
        canApproveRequest: true,
        canSubmitQuote: true,
        canPlaceOrder: true,
        canReceiveOrder: true,
        canViewAnalytics: true,
        canManageUsers: true,
      };
    default:
      return {
        canCreateRequest: false,
        canApproveRequest: false,
        canSubmitQuote: false,
        canPlaceOrder: false,
        canReceiveOrder: false,
        canViewAnalytics: false,
      };
  }
};
