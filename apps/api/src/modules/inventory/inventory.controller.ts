import { Request, Response } from 'express';
import { InventoryService } from './inventory.service';
import { asyncHandler } from '../../utils/async-handler';

export class InventoryController {
  static getBalances = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as any;
    const result = await InventoryService.getBalances(query);
    res.status(200).json({ success: true, ...result });
  });

  static adjustStock = asyncHandler(async (req: Request, res: Response) => {
    const { branchId, productId, quantityChange, type, notes } = req.body;
    const userId = req.user!.userId;

    const result = await InventoryService.adjustStock({
      branchId,
      productId,
      quantityChange,
      type,
      userId,
      notes,
    });

    res.status(200).json({ success: true, data: result });
  });

  static getTransactions = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as any;
    const result = await InventoryService.getTransactions(query);
    res.status(200).json({ success: true, ...result });
  });
}
