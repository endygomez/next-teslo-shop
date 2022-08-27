import { Box, Card, CardContent, Chip, CircularProgress, Divider, Grid, Typography } from '@mui/material';
import { GetServerSideProps, NextPage } from 'next'

import { CartList, OrderSummary } from '../../components/cart';
import { ShopLayout } from '../../components/layouts';
import { AddLink, CreditCardOffOutlined, CreditScoreOutlined } from '@mui/icons-material';
import { getSession } from 'next-auth/react';
import { dbOrders } from '../../database';
import { IOrder } from '../../interfaces';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { tesloApi } from '../../api';
import { useRouter } from 'next/router';
import { useState } from 'react';


type OrderResponseBody = {
    id: string;
    status: "COMPLETED" | "SAVED" | "APPROVED" | "VOIDED" | "PAYER_ACTION_REQUIRED";
};

interface Props {
    order: IOrder
}

const OrderPage: NextPage<Props> = ({ order }) => {

    const router = useRouter();

    const [isPaying, setIsPaying] = useState(false);

    const onOrderCompleted = async (details: OrderResponseBody) => {
        if (details.status !== 'COMPLETED') {
            return alert('No hay pago en PayPal');
        }

        setIsPaying(true);

        try {
            const { data } = await tesloApi.post(`/orders/pay`, {
                transactionId: details.id,
                orderId: order._id
            })

            router.reload();

        } catch (error) {
            setIsPaying(false);
            console.log(error)
            alert('Error');
        }
    }
    return (
        <ShopLayout title={`Resumen de la orden ${order._id}`} pageDescription={'Resumen de la orden'}>
            <Typography variant='h1' component='h1'>Orden: {order._id}</Typography>
            {
                order.isPaid ?
                    (
                        <Chip
                            sx={{ my: 2 }}
                            label='Orden ya fue pagada'
                            variant='outlined'
                            color='success'
                            icon={<CreditScoreOutlined />}
                        />
                    ) :
                    (
                        <Chip
                            sx={{ my: 2 }}
                            label='Pendiente de pago'
                            variant='outlined'
                            color='error'
                            icon={<CreditCardOffOutlined />}
                        />
                    )
            }


            <Grid container className='fadeIn'>
                <Grid item xs={12} sm={7}>
                    <CartList products={order.orderItems} />
                </Grid>
                <Grid item xs={12} sm={5}>
                    <Card className='summary-card'>
                        <CardContent>
                            <Typography variant='h2'>Resumen ({order.numberOfItems} {order.numberOfItems > 1 ? 'productos' : 'producto'})</Typography>
                            <Divider sx={{ my: 1 }} />

                            <Box display='flex' justifyContent='space-between'>
                                <Typography variant='subtitle1'>Dirección de entrega</Typography>
                            </Box>

                            <Typography>{order.shippingAddress.firstName} {order.shippingAddress.firstName}</Typography>
                            <Typography>{order.shippingAddress.address} {order.shippingAddress.address2 ? `, ${order.shippingAddress.address2}` : ''}</Typography>
                            <Typography>{order.shippingAddress.city}, {order.shippingAddress.zip}</Typography>
                            <Typography>{order.shippingAddress.country}</Typography>
                            <Typography>{order.shippingAddress.phone}</Typography>
                            <Divider sx={{ my: 1 }} />

                            <OrderSummary
                                orderValues={{
                                    numberOfItems: order.numberOfItems,
                                    subTotal: order.subTotal,
                                    tax: order.tax,
                                    total: order.total
                                }}
                            />
                            <Box sx={{ mt: 3 }} display='flex' flexDirection='column'>
                                {/* TODO: Pendiente por completar */}

                                <Box
                                    display='flex'
                                    justifyContent='center'
                                    className='fadeIn'
                                    sx={{ display: isPaying ? 'flex' : 'none' }}
                                >
                                    <CircularProgress />
                                </Box>

                                <Box sx={{ display: isPaying ? 'none' : 'flex', flex: 1 }} flexDirection='column'>

                                    {
                                        order.isPaid ?
                                            (
                                                <Chip
                                                    sx={{ my: 2 }}
                                                    label='Orden ya fue pagada'
                                                    variant='outlined'
                                                    color='success'
                                                    icon={<CreditScoreOutlined />}
                                                />
                                            ) :
                                            (
                                                <PayPalButtons
                                                    createOrder={(data, actions) => {
                                                        return actions.order.create({
                                                            purchase_units: [
                                                                {
                                                                    amount: {
                                                                        value: `${order.total}`,
                                                                    },
                                                                },
                                                            ],
                                                        });
                                                    }}
                                                    onApprove={(data, actions) => {
                                                        return actions.order!.capture().then((details: OrderResponseBody) => {/* 
                                                        const name = details.payer.name.given_name!!;
                                                        alert(`Transaction completed by ${name}`);
                                                        console.log({ details }) */
                                                            onOrderCompleted(details);

                                                        });
                                                    }}
                                                />
                                            )
                                    }
                                </Box>
                            </Box>

                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </ShopLayout>
    )
}


// You should use getServerSideProps when:
// - Only if you need to pre-render a page whose data must be fetched at request time

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
    const { id = '' } = query;

    const session: any = await getSession({ req });

    if (!session) {
        return {
            redirect: {
                destination: `/auth/login?p=/oders/${id}`,
                permanent: false
            },
        }
    }

    const order = await dbOrders.getOrderById(id.toString());

    if (!order) {
        return {
            redirect: {
                destination: `/orders/history`,
                permanent: false
            },
        }
    }

    if (order.user !== session.user._id) {
        return {
            redirect: {
                destination: `/orders/history`,
                permanent: false
            },
        }
    }


    return {
        props: {
            order
        }
    }
}

export default OrderPage