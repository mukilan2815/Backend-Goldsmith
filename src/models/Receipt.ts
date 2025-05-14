
export interface ReceiptItem {
  id: string;
  description: string;
  grossWeight: number;
  stoneWeight: number;
  meltingPercent: number;
  rate: number;
  netWeight: number;
  finalWeight: number;
  amount: number;
}

export interface Receipt {
  id: string;
  client: {
    id: string;
    name: string;
    shopName: string;
    mobile: string;
    address: string;
  };
  items: ReceiptItem[];
  totalGrossWeight: number;
  totalStoneWeight: number;
  totalNetWeight: number;
  totalFinalWeight: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}
