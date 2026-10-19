import { Request, Response } from 'express';
import { ProductService } from './product.service';
import { asyncHandler } from '../../utils/async-handler';

export class ProductController {
  static getAllProducts = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as any;
    const result = await ProductService.getAllProducts(query);
    res.status(200).json({ success: true, ...result });
  });

  static getProductById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const product = await ProductService.getProductById(id);
    res.status(200).json({ success: true, data: product });
  });

  static createProduct = asyncHandler(async (req: Request, res: Response) => {
    const product = await ProductService.createProduct(req.body);
    res.status(201).json({ success: true, data: product });
  });

  static updateProduct = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const product = await ProductService.updateProduct(id, req.body);
    res.status(200).json({ success: true, data: product });
  });

  static deleteProduct = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await ProductService.deleteProduct(id);
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  });
}
