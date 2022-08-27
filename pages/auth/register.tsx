import NextLink from 'next/link';
import { Box, Button, Grid, Link, TextField, Typography, Chip } from '@mui/material';
import { GetServerSideProps } from 'next'

import { AuthLayout } from "../../components/layouts"
import { useForm } from 'react-hook-form';
import { useState, useContext } from 'react';
import { ErrorOutline } from '@mui/icons-material';
import { validations } from '../../utils';
import { tesloApi } from '../../api';
import { useRouter } from 'next/router';
import { AuthContext } from '../../context';
import { getSession, signIn } from 'next-auth/react';


type FormData = {
    name: string;
    email: string;
    password: string;
}


const RegisterPage = () => {

    const router = useRouter();
    const { registerUser } = useContext(AuthContext)

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [disabledButton, setDisabledButton] = useState(false);

    const destination = router.query.p?.toString() || '/';
    // nombre required 2 letras minimo
    // correo
    // password 6 caracteres obligatorio
    const onRegisterForm = async ({ name, email, password }: FormData) => {
        setDisabledButton(true);
        setShowError(false);

        const { hasError, message } = await registerUser(name, email, password);

        if (hasError) {
            setShowError(true);
            setDisabledButton(false);
            setErrorMessage(message!)
            setTimeout(() => setShowError(false), 3000);
            return;
        }
        //TODO: Navegar a la pantalla que el usuario estaba
        //const destination = router.query.p?.toString() || '/';
        /*  router.replace(destination); */
        await signIn('credentials', { email, password });
    }

    return (
        <AuthLayout title='register'>
            <form onSubmit={handleSubmit(onRegisterForm)} noValidate>
                <Box sx={{ width: 350, padding: '10px 20px' }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant='h1' component='h1'>Crear cuenta</Typography>
                            <Chip
                                label='No es posible registrar ese usuario'
                                color='error'
                                icon={<ErrorOutline />}
                                className='fadeIn'
                                sx={{ display: showError ? 'flex' : 'none' }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label='Nombre completo'
                                variant='filled'
                                fullWidth
                                {
                                ...register('name', {
                                    required: 'Este campo es requerido',
                                    minLength: {
                                        value: 2,
                                        message: 'Debe tener mínimo 2 caracteres'
                                    }
                                })}
                                error={!!errors.name}
                                helperText={errors.name?.message}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label='Correo'
                                variant='filled'
                                fullWidth
                                {
                                ...register('email', {
                                    required: 'Este campo es requerido',
                                    validate: (value) => validations.isEmail(value) // validations.isEmail
                                })}
                                error={!!errors.email}
                                helperText={errors.email?.message}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label='Contraseña'
                                type='password'
                                variant='filled'
                                fullWidth
                                {...register('password', {
                                    required: 'Este campo es requerido',
                                    minLength: {
                                        value: 6,
                                        message: 'Mínimo 6 caracteres'
                                    }
                                })}
                                error={!!errors.password}
                                helperText={errors.password?.message}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                type='submit'
                                color='secondary'
                                className='circular-btn'
                                size='large'
                                fullWidth
                                disabled={disabledButton ? true : false}
                            >
                                Registrar
                            </Button>
                        </Grid>
                        <Grid item xs={12} display='flex' justifyContent='end'>
                            <NextLink href={`/auth/login?p=${destination}`} passHref>
                                <Link underline='always'>
                                    ¿Ya tienes una cuenta?
                                </Link>
                            </NextLink>
                        </Grid>
                    </Grid>
                </Box>
            </form>
        </AuthLayout>
    )
}

// You should use getServerSideProps when:
// - Only if you need to pre-render a page whose data must be fetched at request time

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
    const session = await getSession({ req });

    const { p = '/' } = query

    if (session) {
        return {
            redirect: {
                destination: p.toString(),
                permanent: false
            }
        }
    }

    return {
        props: {}
    }
}

export default RegisterPage