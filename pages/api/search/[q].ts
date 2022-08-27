import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '../../../database';
import { Product } from '../../../models';
import { IProduct } from '../../../interfaces/products';

type Data = |
{ message: string }
    | IProduct[]

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {

    switch (req.method) {
        case 'GET':
            return searchProducts(req, res);

        default:
            return res.status(400).json({
                message: 'Bad request'
            });
    }
}

async function searchProducts(req: NextApiRequest, res: NextApiResponse<Data>) {

    let { q } = req.query;

    if (q.length === 0) {
        return res.status(400).json({
            message: 'Debe de específicar el query de búsqueda'
        })
    }

    q = q.toString().toLowerCase();

    db.connect();

    const products = await Product.find({
        $text: { $search: q }
    }).select('title images price inStock slug -_id').lean();

    db.disconnect();

    return res.status(200).json(products)
}
