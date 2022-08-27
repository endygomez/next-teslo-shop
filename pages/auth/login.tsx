import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next'
import NextLink from 'next/link'
import { useRouter } from 'next/router';
import { getSession, signIn, getProviders } from 'next-auth/react';
import { Box, Button, Grid, Link, TextField, Typography, Chip, Divider } from '@mui/material';
import { AuthLayout } from "../../components/layouts"
import { useForm } from 'react-hook-form';
import { validations } from '../../utils';
/* import { tesloApi } from '../../api'; */
import { ErrorOutline } from '@mui/icons-material';
/* import { AuthContext } from '../../context'; */

type FormData = {
    email: string,
    password: string,
};


const LoginPage = () => {
    /* const { loginUser } = useContext(AuthContext); */

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
    const [showError, setShowError] = useState(false);
    const [disabledButton, setDisabledButton] = useState(false);

    const [providers, setProviders] = useState<any>({});

    useEffect(() => {
        getProviders().then(prov => {
            setProviders(prov);
        })

    }, [])


    const router = useRouter();
    const destination = router.query.p?.toString() || '/';

    const onLogginUser = async ({ email, password }: FormData) => {
        setDisabledButton(true);
        setShowError(false);

        /* const isValidLogin = await loginUser(email, password);

        if (!isValidLogin) {
            setShowError(true);
            setDisabledButton(false);
            setTimeout(() => {
                setShowError(false)
            }, 3000);
            return;
        }
        const { data } = await tesloApi.post('/user/login', { email, password });
        setDisabledButton(false);

        //TODO: Navegar a la pantalla donde el usuario estaba
        //const destination = router.query.p?.toString() || '/';
        router.replace(destination); */

        await signIn('credentials', { email, password });
    }

    return (
        <AuthLayout title='login'>
            <form onSubmit={handleSubmit(onLogginUser)} noValidate>
                <Box sx={{ width: 350, padding: '10px 20px' }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant='h1' component='h1'>Iniciar Sesión</Typography>
                            <Chip
                                label='No reconocemos ese usuario'
                                color='error'
                                icon={<ErrorOutline />}
                                className='fadeIn'
                                sx={{ display: showError ? 'flex' : 'none' }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label='Correo'
                                type='email'
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
                                Ingresar
                            </Button>
                        </Grid>
                        <Grid item xs={12} display='flex' justifyContent='end'>
                            <NextLink href={`/auth/register?p=${destination}`} passHref>
                                <Link underline='always'>
                                    ¿No tienes cuenta?
                                </Link>
                            </NextLink>
                        </Grid>

                        <Grid item xs={12} display='flex' flexDirection='column' justifyContent='end'>
                            <Divider sx={{ width: '100%', mb: 2 }} />
                            {
                                Object.values(providers).map((provider: any) => {

                                    if (provider.id === 'credentials') return (<div key='credentials'></div>);
                                    return (
                                        <Button
                                            key={provider.id}
                                            variant='outlined'
                                            fullWidth
                                            color='primary'
                                            sx={{ mb: 1 }}
                                            onClick={() => signIn(provider.id)}
                                        >
                                            {provider.name}
                                        </Button>
                                    )
                                })

                            }
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

export default LoginPage