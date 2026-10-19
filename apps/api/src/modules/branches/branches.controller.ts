import { Request, Response } from 'express';
import { BranchesService } from './branches.service';
import { asyncHandler } from '../../utils/async-handler';

export class BranchesController {
  static getAllBranches = asyncHandler(async (_req: Request, res: Response) => {
    const branches = await BranchesService.getAllBranches();
    res.status(200).json({ success: true, data: branches });
  });

  static getBranchById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const branch = await BranchesService.getBranchById(id);
    res.status(200).json({ success: true, data: branch });
  });

  static createBranch = asyncHandler(async (req: Request, res: Response) => {
    const { name, code, address, isActive } = req.body;
    const branch = await BranchesService.createBranch({ name, code, address, isActive });
    res.status(201).json({ success: true, data: branch });
  });

  static updateBranch = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, code, address, isActive } = req.body;
    const branch = await BranchesService.updateBranch(id, { name, code, address, isActive });
    res.status(200).json({ success: true, data: branch });
  });

  static deleteBranch = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await BranchesService.deleteBranch(id);
    res.status(200).json({ success: true, message: 'Branch deleted successfully' });
  });
}
