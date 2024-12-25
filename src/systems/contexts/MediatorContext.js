import React, { createContext, useContext } from 'react'

const MediatorContext = createContext(null)

export const useMediator = () => {
    const context = useContext(MediatorContext)
    if (!context) {
        throw new Error('useMediator must be used within a MediatorProvider')
    }
    return context
}

export default MediatorContext
