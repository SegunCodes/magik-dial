import { Request, Response } from 'express';
import {createProduct,enableProduct,disableProduct,deleteProduct}from '../../services/products.service'


export const createProductHandler = async (req: Request, res: Response) => {
  try {
    const productData = req.body;
    const createdProduct = await createProduct(productData);
    res.status(201).json(createdProduct);
  } catch (error : any) {
    res.status(500).json({ error: error.message });
  }
};

export const enableProductHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const enabledProduct = await enableProduct(id);
    res.status(200).json(enabledProduct);
  } catch (error) {
    res.status(500).json({ error: 'Failed to enable the product' });
  }
};

export const disableProductHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const disabledProduct = await disableProduct(id);
    res.status(200).json(disabledProduct);
  } catch (error) {
    res.status(500).json({ error: 'Failed to disable the product' });
  }
};

export const deleteProductHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteProduct(id);
    res.status(204).json({success: true, message: 'product deleted successfully'});
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete the product' });
  }
};
