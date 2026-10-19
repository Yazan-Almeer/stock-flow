import { Request, Response } from 'express';
import { ReportsService } from './reports.service';
import { asyncHandler } from '../../utils/async-handler';

export class ReportsController {
  static getInventoryValuation = asyncHandler(async (_req: Request, res: Response) => {
    const valuation = await ReportsService.getInventoryValuation();
    res.status(200).json({ success: true, data: valuation });
  });

  static getAuditLogs = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as any;
    const result = await ReportsService.getAuditLogs(query);
    res.status(200).json({ success: true, ...result });
  });
}
