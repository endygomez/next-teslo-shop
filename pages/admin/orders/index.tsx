import useSWR from 'swr';
import { AdminLayout } from '../../../components/layouts/AdminLayout';
import { ConfirmationNumberOutlined } from '@mui/icons-material';
import { Chip, Grid } from '@mui/material';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import { IOrder, IUser } from '../../../interfaces';

const columns: GridColDef[] = [
    { field: 'id', headerName: 'Order ID', width: 250 },
    { field: 'email', headerName: 'Correo', width: 250 },
    { field: 'name', headerName: 'Nombre completo', width: 300 },
    { field: 'total', headerName: 'Monto total', width: 150 },
    {
        field: 'isPaid',
        headerName: 'Pagada',
        renderCell: ({ row }: GridValueGetterParams) => {
            return row.isPaid
                ? (<Chip variant='outlined' label='Pagada' color='success'></Chip>)
                : (<Chip variant='outlined' label='Pendiente' color='error'></Chip>)
        }
    },
    { field: 'noProducts', headerName: 'No.Productos', align: 'center', width: 150 },
    {
        field: 'check',
        headerName: 'Ver orden',
        renderCell: ({ row }: GridValueGetterParams) => {
            return (
                <a href={`/admin/orders/${row.id}`} target='_blank' rel='noreferrer'>
                    Ver orden
                </a>
            )
        }
    },
    { field: 'createdAt', headerName: 'Creada en', width: 300 },

]

const OrdersPage = () => {

    const { data, error } = useSWR<IOrder[]>('/api/admin/OrdersPage');

    if (!data && !error) return (<></>);

    const rows = data!.map(order => ({
        id: order._id,
        email: (order.user as IUser).email,
        name: (order.user as IUser).name,
        total: order.total,
        isPaid: order.isPaid,
        noProducts: order.numberOfItems,
        createdAt: order.createdAt
    }));

    return (
        <AdminLayout
            title='Ordenes'
            subTitle='Mantenimiento de ordenes'
            icon={<ConfirmationNumberOutlined />}
        >
            <Grid container className='fadeIn'>
                <Grid item sx={{ height: 650, width: '100%' }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        pageSize={10}
                        rowsPerPageOptions={[10]} />

                </Grid>
            </Grid>
        </AdminLayout>
    )
}

export default OrdersPage