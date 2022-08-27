import { createContext } from 'react'

interface ContextProps {
    isMenuOpen: boolean;
    toggleSideMenu: () => void;
    
}

export const UiContext = createContext({} as ContextProps);



// Create Hook
/* import { createContext } from 'react'

interface ContextProps {
    prop1: boolean;
}

export const NameContext = createContext({} as ContextProps); */