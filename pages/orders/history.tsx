import { GetServerSideProps, NextPage } from 'next'
import { getSession } from 'next-auth/react';
import { Typography, Grid, Chip, Link } from '@mui/material';

import NextLink from 'next/link';
import { ShopLayout } from '../../components/layouts'
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import { getOrders } from '../../database/dbOrders';
import { IOrder } from '../../interfaces';

const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'fullname', headerName: 'Nombre Completo', width: 300, sortable: true },

    {
        field: 'paid',
        headerName: 'Pagada',
        description: 'Muestra información si está pagada la orden o no',
        width: 200,
        renderCell: (params: GridValueGetterParams) => {
            return (
                params.row.paid
                    ? <Chip color='success' label='Pagada' variant='outlined' />
                    : <Chip color='error' label='Pagada' variant='outlined' />
            )
        }
    },
    {
        field: 'order',
        headerName: 'Ver orden',
        width: 200,
        sortable: false,
        renderCell: (params: GridValueGetterParams) => {
            return (
                params.row.orderId &&
                <NextLink href={`/orders/${params.row.orderId}`} passHref>
                    <Link underline='always'>
                        Ver orden
                    </Link>
                </NextLink>
            )
        }
    },
]

interface Props {
    orders: IOrder[]
}

const HistoryPage: NextPage<Props> = ({ orders }) => {


    const rows = orders.map((order, index) => ({
        id: index + 1,
        paid: order.isPaid,
        fullname: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
        orderId: order._id
    }))
    return (
        <ShopLayout title='Historial de ordenes' pageDescription='Historial de ordenes del cliente'>
            <Typography variant='h1' component='h1'>Historial de ordenes</Typography>

            <Grid container className='fadeIn'>
                <Grid item sx={{ height: 650, width: '100%' }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        pageSize={10}
                        rowsPerPageOptions={[10]} />

                </Grid>
            </Grid>
        </ShopLayout>
    )
}

// You should use getServerSideProps when:
// - Only if you need to pre-render a page whose data must be fetched at request time

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    const session: any = await getSession({ req });

    if (!session) {
        return {
            redirect: {
                destination: '/auth/login?p=/orders/history',
                permanent: false
            }
        }
    }


    const orders = await getOrders(session.user._id)

    console.log(orders)

    return {
        props: {
            orders
        }
    }
}

export default HistoryPage