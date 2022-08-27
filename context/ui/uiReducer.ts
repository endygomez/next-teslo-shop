import { UiState } from "./";

type UiActionType =
    | { type: '[UI] - ToggleSideMenu' }


export const uiReducer = (state: UiState, action: UiActionType): UiState => {
    switch (action.type) {
        case '[UI] - ToggleSideMenu':
            return {
                ...state,
                isMenuOpen: !state.isMenuOpen
            }

        default:
            return state;
    }
}


//Create Snipet
/* import { NameState } from './'
import { UiState } from './UiProvider';

type NameActionType =
    | { type: '[Name] - ActionName' }


export const NameReducer = { state: NameState, action: NameActionType }: NameState => {
    switch (action.type) {
        case '[Name] - ActioName':
            return {
                ...state,
            }

            default:
                return state;
    }
} */