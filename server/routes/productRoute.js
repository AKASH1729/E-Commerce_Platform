import express from "express";
import { addProduct, productList, productById, changeStock } from "../controllers/productController.js";
import authSeller from "../middlewares/authSeller.js";
import { upload } from "../configs/multer.js";  // ✅ named import

const productRouter = express.Router();

productRouter.post('/add', upload.array(["images"]), authSeller, addProduct);
productRouter.get('/list', productList);
productRouter.post('/id', productById);
productRouter.post('/stock', changeStock);

export default productRouter;
