import { Request, Response } from 'express';
import { TransferService } from './transfer.service';
import { asyncHandler } from '../../utils/async-handler';

export class TransferController {
  static createTransfer = asyncHandler(async (req: Request, res: Response) => {
    const { sourceBranchId, destinationBranchId, items } = req.body;
    const userId = req.user!.userId;

    const transfer = await TransferService.createTransfer({
      sourceBranchId,
      destinationBranchId,
      userId,
      items,
    });

    res.status(201).json({ success: true, data: transfer });
  });

  static getTransfers = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as any;
    const result = await TransferService.getTransfers(query);
    res.status(200).json({ success: true, ...result });
  });

  static getTransferById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const transfer = await TransferService.getTransferById(id);
    res.status(200).json({ success: true, data: transfer });
  });

  static approveTransfer = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const transfer = await TransferService.approveTransfer(id);
    res.status(200).json({ success: true, data: transfer });
  });

  static dispatchTransfer = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.userId;

    const transfer = await TransferService.dispatchTransfer(id, userId);
    res.status(200).json({ success: true, data: transfer });
  });

  static receiveTransfer = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.userId;

    const transfer = await TransferService.receiveTransfer(id, userId);
    res.status(200).json({ success: true, data: transfer });
  });

  static cancelTransfer = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.userId;

    const transfer = await TransferService.cancelTransfer(id, userId);
    res.status(200).json({ success: true, data: transfer });
  });
}
