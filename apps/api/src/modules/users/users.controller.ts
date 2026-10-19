import { Request, Response } from 'express';
import { UsersService } from './users.service';
import { asyncHandler } from '../../utils/async-handler';

export class UsersController {
  static getAllUsers = asyncHandler(async (_req: Request, res: Response) => {
    const users = await UsersService.getAllUsers();
    res.status(200).json({ success: true, data: users });
  });

  static getUserById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await UsersService.getUserById(id);
    res.status(200).json({ success: true, data: user });
  });

  static createUser = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password, role } = req.body;
    const user = await UsersService.createUser({ name, email, password, role });
    res.status(201).json({ success: true, data: user });
  });

  static updateUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, email, role } = req.body;
    const user = await UsersService.updateUser(id, { name, email, role });
    res.status(200).json({ success: true, data: user });
  });

  static updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const user = await UsersService.updateStatus(id, status);
    res.status(200).json({ success: true, data: user });
  });
}
