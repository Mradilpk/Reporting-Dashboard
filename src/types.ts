export interface Metric {
  label: string;
  value: string | number;
  icon: string; // Lucide icon name
  color: string;
}

export interface Lead {
  id: string;
  businessName: string;
  contactPerson: string;
  segment: string;
  potential?: string;
  visitNotes?: number;
  lineManagerNotes?: number;
  managerNotes?: number;
  confirmOrder?: number;
  totalSale?: string;
  recovery?: string;
  phone: string;
  city: string;
  brick: string;
  brickRoute?: string;
  area?: string;
  group: string;
  product: string;
  manager: string;
  province?: string;
  date: string;
  status?: string;
}

export type MessageRole = 'Sales Person' | 'Customer' | 'Line Manager' | 'Manager';

export type OrderStatus = 'Confirm Order' | 'Recovery';

export interface TimelineEntry {
  id: string;
  role: MessageRole;
  name: string;
  time: string;
  date: string;
  message: string;
  promotedProduct?: string;
  status?: string;
  metrics?: {
    qty?: string;
    totalSale?: string;
    recovery?: string;
    product?: string;
    orderItems?: {
      product: string;
      qty: string;
      unit: string;
      value: string;
    }[];
  };
  initials?: string;
  avatar?: string;
}
