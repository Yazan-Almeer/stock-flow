import { Request, Response } from 'express';
import { CategoriesService } from './categories.service';
import { asyncHandler } from '../../utils/async-handler';

export class CategoriesController {
  static getAllCategories = asyncHandler(async (_req: Request, res: Response) => {
    const categories = await CategoriesService.getAllCategories();
    res.status(200).json({ success: true, data: categories });
  });

  static getCategoryById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const category = await CategoriesService.getCategoryById(id);
    res.status(200).json({ success: true, data: category });
  });

  static createCategory = asyncHandler(async (req: Request, res: Response) => {
    const { name, slug } = req.body;
    const category = await CategoriesService.createCategory({ name, slug });
    res.status(201).json({ success: true, data: category });
  });

  static updateCategory = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, slug } = req.body;
    const category = await CategoriesService.updateCategory(id, { name, slug });
    res.status(200).json({ success: true, data: category });
  });

  static deleteCategory = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await CategoriesService.deleteCategory(id);
    res.status(200).json({ success: true, message: 'Category deleted successfully' });
  });
}
