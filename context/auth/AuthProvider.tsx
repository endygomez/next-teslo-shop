import { FunctionComponent, useReducer, ReactNode, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useSession, signOut } from 'next-auth/react'
import { tesloApi } from '../../api';
import { IUser } from '../../interfaces';
import { AuthContext, authReducer } from "./";
import axios from 'axios';
import { useRouter } from 'next/router';

export interface AuthState {
    isLoggedIn: boolean;
    user?: IUser;
}

const AUTH_INITIAL_STATE: AuthState = {
    isLoggedIn: false,
    user: undefined
}

interface Props {
    children?: ReactNode,
    toggleSideMenu?: () => void
}

export const AuthProvider: FunctionComponent<Props> = ({ children }) => {

    const [state, dispatch] = useReducer(authReducer, AUTH_INITIAL_STATE);
    const router = useRouter();


    const { data, status } = useSession();

    useEffect(() => {

        if (status === 'authenticated')
            dispatch({ type: '[Auth] - Login', payload: data?.user as IUser })

    }, [status, data])

    //Autenticación personalizada
    /* useEffect(() => {
        checkToken();
    }, []) */

    const checkToken = async () => {

        if (Cookies.get('token') === undefined) return;
        try {
            //llamar al endpoint
            const { data } = await tesloApi.get('/user/validate-token');
            const { token, user } = data;

            // Revalidar token guardando el nuevo
            Cookies.set('token', token);
            // dispatch login
            dispatch({ type: '[Auth] - Login', payload: user });
        } catch (error) {

            // MAL
            // Borrar el token de las cookies
            Cookies.remove('token');
        }

    }


    const loginUser = async (email: string, password: string): Promise<boolean> => {
        try {
            const { data } = await tesloApi.post('/user/login', { email, password });
            const { token, user } = data;

            Cookies.set('token', token);
            dispatch({ type: '[Auth] - Login', payload: user });
            return true;
        } catch (error) {
            return false;
        }
    }

    const registerUser = async (name: string, email: string, password: string): Promise<{ hasError: boolean; message?: string }> => {
        try {
            const { data } = await tesloApi.post('/user/register', { name, email, password })
            const { token, user } = data;

            Cookies.set('token', token);
            dispatch({ type: '[Auth] - Login', payload: user });

            return {
                hasError: false
            }
        } catch (error) {
            console.log(error)
            if (axios.isAxiosError(error)) {
                return {
                    hasError: true,
                    message: error.message
                }
            }

            return {
                hasError: true,
                message: 'No se pudo crear el usuario - intente de nuevo'
            }
        }
    }

    const logoutUser = () => {
        Cookies.remove('cart');
        Cookies.remove('firstName');
        Cookies.remove('lastName');
        Cookies.remove('address');
        Cookies.remove('address2');
        Cookies.remove('zip');
        Cookies.remove('city');
        Cookies.remove('country');
        Cookies.remove('phone');
        
        signOut();

        /* Cookies.remove('token'); */
        /* router.reload(); */
        //dispatch({ type: '[Auth] - Logout'});
    }


    return (
        <AuthContext.Provider value={{
            ...state,
            //methods
            loginUser,
            logoutUser,
            registerUser,
        }}>
            {children}
        </AuthContext.Provider>
    )
}