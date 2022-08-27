import type { NextApiRequest, NextApiResponse } from 'next'
import { IProduct } from '../../../interfaces';
import { db } from '../../../database';
import { Product } from '../../../models';
import { isValidObjectId } from 'mongoose';

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config(process.env.CLOUDINARY_URL || '')

type Data =
    | { message: string }
    | IProduct[]
    | IProduct

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    switch (req.method) {
        case 'GET':
            return getProducts(req, res);

        case 'PUT':
            return updateProduct(req, res);
        case 'POST':
            return createProduct(req, res);
        default:
            res.status(400).json({ message: 'Bad request' })
    }
}

const getProducts = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    await db.connect();
    const products = await Product.find()
        .sort({ title: 'asc' })
        .lean();
    await db.disconnect();


    //TODO: Tendremos que actualizar las imagenes
    const updateProducts = products.map(product => {
        product.images = product.images.map((image) => {
            return image.includes('http') ? image : `${process.env.HOST_NAME}products/${image}`
        })

        return product;
    });

    res.status(200).json(updateProducts);
}
const updateProduct = async (req: NextApiRequest, res: NextApiResponse<Data>) => {

    const { _id = '', images = [] } = req.body as IProduct;
    
    if (!isValidObjectId(_id)) {
        return res.status(400).json({ message: 'El id del producto no es válido' });
    }
    
    if (images.length < 2) {
        return res.status(400).json({ message: 'Es necesario al menos dos imágenes' });
    }

    //TODO: posiblemente tendrémos un localhost:3000/products/image.jpg

    try {
        await db.connect();

        const product = await Product.findById(_id);
        if (!product) {
            await db.disconnect();
            return res.status(400).json({ message: 'No existe un producto con ese id' });
        }

        // TODO: eliminar imagenes en Cloudinaryimage
        product.images.forEach(async (image) => {
            if (!images.includes(image)) {
                //Borrar de cloudinary
                const [fileId, extension] = image.substring(image.lastIndexOf('/') + 1).split('.');
                console.log({ fileId, extension, image})
                await cloudinary.uploader.destroy(fileId);

            }
        })

        await product.updateOne(req.body);
        await db.disconnect();

        return res.status(200).json(product);
    } catch (error) {
        console.log(error);
        await db.disconnect();
        return res.status(400).json({ message: 'Revisar la consola del servidor' });
    }

}

const createProduct = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    const { images = [] } = req.body as IProduct;

    if (images.length < 2) {
        return res.status(400).json({ message: 'Es necesario al menos dos imágenes' });
    }

    try {
        await db.connect();

        const productInDb = await Product.findOne({ slug: req.body.slug });

        if (productInDb) {
            await db.disconnect();
            return res.status(400).json({ message: 'Ya existe un producto con ese slug' });

        }

        const product = new Product(req.body);
        await product.save();

        await db.disconnect();

        return res.status(201).json(product);

    } catch (error) {
        console.log(error);
        await db.disconnect();
        return res.status(400).json({ message: 'Revisar logs del servidor' });

    }

    //TODO: posiblemente tendrémos un localhost:3000/products/image.jpg

}

