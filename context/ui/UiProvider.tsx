import { FunctionComponent, useReducer, ReactNode } from 'react';
import { UiContext, uiReducer } from "./";

export interface UiState {
    isMenuOpen: boolean;
}

const UI_INITIAL_STATE: UiState = {
    isMenuOpen: false
}

interface Props {
    children?: ReactNode,
    toggleSideMenu?: () => void
}

export const UiProvider: FunctionComponent<Props> = ({ children }) => {

    const [state, dispatch] = useReducer(uiReducer, UI_INITIAL_STATE);

    const toggleSideMenu = () => {
        dispatch({ type: '[UI] - ToggleSideMenu' })
    }

    return (
        <UiContext.Provider value={{
            ...state,
            //methods
            toggleSideMenu,
        }}>
            {children}
        </UiContext.Provider>
    )
}



//Create snipet
/* import { FC, useReducer } from "react";
import { UiContext, uiReducer } from "./";
import { uiReducer } from './uiReducer';

export interface UiState {
    isMenuOpen: boolean;
}

const Ui_INITIAL_STATE: UiState = {
    isMenuOpen: false
}

export const UiProvider: FC = ({ children }) => {
    const [state, dispatch] = useReducer(uiReducer, Ui_INITIAL_STATE);

    return (
        <UiContext.Provider value={{
            ...state
        }}>
            {children}
        </UiContext.Provider>
    )
} */