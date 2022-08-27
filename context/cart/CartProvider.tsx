import { FunctionComponent, useReducer, ReactNode, useEffect } from 'react';
import { ICartProduct, IOrder, ShippingAddress } from '../../interfaces';
import { CartContext, cartReducer } from "./";
import Cookie from 'js-cookie';
import { tesloApi } from '../../api';
import axios from 'axios';

export interface CartState {
    isLoaded: boolean;
    cart: ICartProduct[];
    numberOfItems: number;
    subTotal: number;
    tax: number;
    total: number;
    shippingAddress?: ShippingAddress;
}



const CART_INITIAL_STATE: CartState = {
    isLoaded: false,
    cart: [],
    numberOfItems: 0,
    subTotal: 0,
    tax: 0,
    total: 0,
    shippingAddress: undefined
}

interface Props {
    children?: ReactNode
}

export const CartProvider: FunctionComponent<Props> = ({ children }) => {

    const [state, dispatch] = useReducer(cartReducer, CART_INITIAL_STATE);

    // Efecto lea de la cookie y recargué el carrito
    useEffect(() => {
        try {
            const productsFromCookies = Cookie.get('cart') ? JSON.parse(Cookie.get('cart')!) : []
            dispatch({ type: '[Cart] - LoadCart from cookies | storage', payload: productsFromCookies });
        } catch (error) {
            dispatch({ type: '[Cart] - LoadCart from cookies | storage', payload: [] });
        }
    }, []);

    useEffect(() => {
        if (Cookie.get('firstName')) {
            const shippingAddress = {
                firstName: Cookie.get('firstName') || '',
                lastName: Cookie.get('lastName') || '',
                address: Cookie.get('address') || '',
                address2: Cookie.get('address2') || '',
                zip: Cookie.get('zip') || '',
                city: Cookie.get('city') || '',
                country: Cookie.get('country') || '',
                phone: Cookie.get('phone') || '',
            }
            dispatch({ type: '[Cart] - Load Address from cookies', payload: shippingAddress })
        }
    }, []);


    useEffect(() => {
        if (state.cart.length > 0) Cookie.set('cart', JSON.stringify(state.cart));
    }, [state.cart]);


    useEffect(() => {
        const numberOfItems = state.cart.reduce((prev, current) => current.quantity + prev, 0);
        const subTotal = state.cart.reduce((prev, current) => (current.price * current.quantity) + prev, 0);
        const taxRate = Number(process.env.NEXT_PUBLIC_TAX_RATE || 0);

        const orderSummary = {
            // Obtenemos mediante iteraciones, un calculo con el valor anterior y el nuevo valor
            numberOfItems,
            subTotal,
            tax: subTotal * taxRate,
            total: subTotal * (taxRate + 1)
        }

        dispatch({ type: '[Cart] - Update order summary', payload: orderSummary });
    }, [state.cart])



    const addProductToCart = (product: ICartProduct) => {
        //! Nivel 1
        /* dispatch({ type: '[Cart] - Add Product', payload: product }) */

        //! Nivel 2
        /* const productsInCart = state.cart.filter(item => item._id !== product._id && item.size !== product.size);
        dispatch({ type: '[Cart] - Add Product', payload: [...productsInCart, product] }) */

        //! Nivel final
        // Evaluar si existe el producto en el carrito
        const productInCart = state.cart.some(item => item._id === product._id);
        if (!productInCart) return dispatch({ type: '[Cart] - Update products in cart', payload: [...state.cart, product] });

        // Evaluar si existe el producto en el carrito por la talla
        const productInCartButDifferentSize = state.cart.some(item => item._id === product._id && item.size === product.size);
        if (!productInCartButDifferentSize) return dispatch({ type: '[Cart] - Update products in cart', payload: [...state.cart, product] });

        // Acumular
        const updatedProducts: ICartProduct[] = state.cart.map(item => {
            if (item._id !== product._id) return item;
            if (item.size !== product.size) return item;

            // Actualizar la cantidad
            item.quantity += product.quantity;

            return item;
        });
        dispatch({ type: '[Cart] - Update products in cart', payload: updatedProducts });
    }

    const updateCartQuantity = (product: ICartProduct) => {
        dispatch({ type: '[Cart] - Change product cart quantity', payload: product })
    }

    const removeCartProduct = (product: ICartProduct) => {
        dispatch({ type: '[Cart] - Remove product in cart', payload: product })
    }

    const updateAddress = (address: ShippingAddress) => {
        Cookie.set('firstName', address.firstName);
        Cookie.set('lastName', address.lastName);
        Cookie.set('address', address.address);
        Cookie.set('address2', address.address2 || '');
        Cookie.set('zip', address.zip);
        Cookie.set('city', address.city);
        Cookie.set('country', address.country);
        Cookie.set('phone', address.phone);
        dispatch({ type: '[Cart] - Update Shipping Address', payload: address })
    }

    const createOrder = async (): Promise<{ hasError: boolean; message: string }> => {
        if (!state.shippingAddress) {
            throw new Error('No hay dirección de entrega');
        }

        const body: IOrder = {
            orderItems: state.cart.map(p => ({
                ...p,
                size: p.size!
            })),
            shippingAddress: state.shippingAddress,
            numberOfItems: state.numberOfItems,
            subTotal: state.subTotal,
            tax: state.tax,
            total: state.total,
            isPaid: false
        }

        try {
            const { data } = await tesloApi.post<IOrder>('/orders', body)

            //TODO: Dispatch para limpiar carrito, state
            dispatch({ type: '[Cart] - Order complete' });
            return {
                hasError: false,
                message: data._id!
            }
        } catch (error: any) {
            console.log(error)
            if (axios.isAxiosError(error)) {
                return {
                    hasError: true,
                    message: error.message
                }
            }
            return {
                hasError: true,
                message: 'Error no controlado, hable con el administrador'
            }
        }
    }

    return (
        <CartContext.Provider value={{
            ...state,
            //methods
            addProductToCart,
            updateCartQuantity,
            removeCartProduct,
            updateAddress,
            createOrder
        }}>
            {children}
        </CartContext.Provider>
    )
}