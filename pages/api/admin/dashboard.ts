import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '../../../database';
import { Order, Product, User } from '../../../models';

type Data =
    | {
        numberOfOrders: number; // conteo
        paidOrders: number; // isPaid true
        notPaidOrders: number;
        numberOfClients: number; // role: client
        numberOfProducts: number;
        productsWithNoInventory: number; // productos con inventario 0
        lowInventory: number; // productos con 10 o menos artículos inStock
    }
    | { message: string }

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {

    switch (req.method) {
        case 'GET':
            return getDataToDashboard(req, res);

        default:
            res.status(400).json({ message: 'Bad request' })
    }


}

const getDataToDashboard = async (req: NextApiRequest, res: NextApiResponse<Data>) => {

    try {
        await db.connect();

        /* const numberOfOrders = await Order.count();
        const paidOrders = await Order.find({ isPaid: true }).count();
        const notPaidOrders = numberOfOrders - paidOrders
        const numberOfClients = await User.find({ role: 'client' }).count();
        const numberOfProducts = await Product.count();
        const productsWithNoInventory = await Product.find({ inStock: 0 }).count();
        const lowInventory = await Product.find({ inStock: { $lte: 10 } }).count(); */

        // Response en cada posición, la respectiva consulta
        const [
            numberOfOrders,
            paidOrders,
            numberOfClients,
            numberOfProducts,
            productsWithNoInventory,
            lowInventory
        ] = await Promise.all([
            Order.count(),
            Order.find({ isPaid: true }).count(),
            User.find({ role: 'client' }).count(),
            Product.count(),
            Product.find({ inStock: 0 }).count(),
            Product.find({ inStock: { $lte: 10 } }).count()
        ]);

        await db.disconnect();
        return res.status(200).json({
            numberOfOrders,
            paidOrders,
            notPaidOrders: numberOfOrders - paidOrders,
            numberOfClients,
            numberOfProducts,
            productsWithNoInventory,
            lowInventory
        })
    } catch (error) {
        return res.status(400).json({
            message: 'Error en base de datos'
        })
    }
}
