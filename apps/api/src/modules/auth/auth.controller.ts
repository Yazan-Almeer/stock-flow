import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { asyncHandler } from '../../utils/async-handler';

export class AuthController {
  static login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    res.status(200).json({
      success: true,
      data: result,
    });
  });

  static getMe = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const user = await AuthService.getProfile(userId);
    res.status(200).json({
      success: true,
      data: user,
    });
  });

  static logout = asyncHandler(async (_req: Request, res: Response) => {
    // Stateless JWT logout is handled client-side by deleting the token.
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  });
}
