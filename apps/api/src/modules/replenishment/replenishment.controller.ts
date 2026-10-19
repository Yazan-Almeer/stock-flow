import { Request, Response } from 'express';
import { ReplenishmentService } from './replenishment.service';
import { asyncHandler } from '../../utils/async-handler';

export class ReplenishmentController {
  static getRecommendations = asyncHandler(async (_req: Request, res: Response) => {
    const recommendations = await ReplenishmentService.getReplenishmentRecommendations();
    res.status(200).json({ success: true, data: recommendations });
  });
}
