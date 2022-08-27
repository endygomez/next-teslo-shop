import useSWR from 'swr';
import { AttachMoneyOutlined, CreditCardOutlined, CreditCardOffOutlined, DashboardOutlined, GroupOutlined, CategoryOutlined, CancelPresentationOutlined, ProductionQuantityLimitsOutlined, AccessTimeOutlined } from '@mui/icons-material';
import { Grid, Typography } from '@mui/material';
import SummaryTile from '../../components/admin/SummaryTile';
import { AdminLayout } from '../../components/layouts/AdminLayout';
import { DashboardSummaryResponse } from '../../interfaces';
import { useState, useEffect } from 'react';

const DashboardPage = () => {

    const { data, error } = useSWR<DashboardSummaryResponse>('/api/admin/dashboard', {
        refreshInterval: 30 * 1000 //30 segundos
    });

    const [refreshIn, setRefreshIn] = useState(30);

    useEffect(() => {
        const interval = setInterval(() => {
            console.log('Tick');
            setRefreshIn(refreshIn => refreshIn > 0 ? refreshIn - 1 : 30);
        }, 1000)

        return () => clearInterval(interval)
    }, [])


    if (!error && !data) {
        return <></>
    }

    if (error) {
        console.log(error);
        return <Typography>Error al cargar la información</Typography>
    }

    const {
        numberOfOrders,
        paidOrders,
        notPaidOrders,
        numberOfClients,
        numberOfProducts,
        productsWithNoInventory,
        lowInventory
    } = data!;

    return (
        <AdminLayout
            title='Dashboard'
            subTitle='Estadísticas Generales'
            icon={<DashboardOutlined />}
        >
            <Grid
                container
                spacing={2}
            >
                <SummaryTile
                    title={numberOfOrders}
                    subTitle='Ordenes Totales'
                    icon={<CreditCardOutlined color='secondary' sx={{ fontSize: 40 }} />}
                />

                <SummaryTile
                    title={paidOrders}
                    subTitle='Ordenes Pagadas'
                    icon={<AttachMoneyOutlined color='success' sx={{ fontSize: 40 }} />}
                />

                <SummaryTile
                    title={notPaidOrders}
                    subTitle='Ordenes Pendientes'
                    icon={<CreditCardOffOutlined color='error' sx={{ fontSize: 40 }} />}
                />

                <SummaryTile
                    title={numberOfClients}
                    subTitle='Clientes'
                    icon={<GroupOutlined color='primary' sx={{ fontSize: 40 }} />}
                />

                <SummaryTile
                    title={numberOfProducts}
                    subTitle='Productos'
                    icon={<CategoryOutlined color='warning' sx={{ fontSize: 40 }} />}
                />

                <SummaryTile
                    title={productsWithNoInventory}
                    subTitle='Sin Existencias'
                    icon={<CancelPresentationOutlined color='error' sx={{ fontSize: 40 }} />}
                />

                <SummaryTile
                    title={lowInventory}
                    subTitle='Bajo inventario'
                    icon={<ProductionQuantityLimitsOutlined color='warning' sx={{ fontSize: 40 }} />}
                />

                <SummaryTile
                    title={refreshIn}
                    subTitle='Actualización en'
                    icon={<AccessTimeOutlined color='secondary' sx={{ fontSize: 40 }} />}
                />

            </Grid>
        </AdminLayout>
    )
}

export default DashboardPage