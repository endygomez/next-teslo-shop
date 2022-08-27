import { Box } from "@mui/system";
import Head from "next/head"
import { FunctionComponent, ReactNode } from 'react';

interface Props {
    title: string;
    children: ReactNode;
}
export const AuthLayout: FunctionComponent<Props> = ({ title, children }) => {
    return (
        <>
            <Head>
                <title>{title}</title>
            </Head>
            <main>
                <Box display='flex' justifyContent='center' alignItems='center' height='calc(100vh - 200px)'>
                    { children }
                </Box>
            </main>
        </>
    )
}
