export interface CreateTransferDto {
  sourceBranchId: string;
  destinationBranchId: string;
  items: Array<{
    productId: string;
    requestedQuantity: number;
  }>;
}

export interface DispatchTransferDto {
  items: Array<{
    itemId: string;
    dispatchedQuantity: number;
  }>;
}

export interface ReceiveTransferDto {
  items: Array<{
    itemId: string;
    receivedQuantity: number;
  }>;
}
