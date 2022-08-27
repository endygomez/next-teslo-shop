import { Grid } from '@mui/material';
import { FunctionComponent } from 'react';
import { IProduct } from '../../interfaces';
import { ProductCard } from '.';

interface Props {
    products: IProduct[]
}
export const ProductList: FunctionComponent<Props> = ({ products }) => {
  return (
    <Grid container spacing={4}>
        {
            products.map( product => (
                <ProductCard
                    key={ product.slug }
                    product={ product } />
            ))
        }
    </Grid>
  )
}
