// src/hooks/useWindowSize.js

import { useState, useEffect } from 'react'

/**
 * Custom hook to track window size.
 *
 * @returns {Object} - An object containing the current window width and height.
 */
const useWindowSize = () => {
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    })

    useEffect(() => {
        // Handler to call on window resize
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            })
        }

        // Add event listener
        window.addEventListener('resize', handleResize)

        // Call handler right away so state gets updated with initial window size
        handleResize()

        // Remove event listener on cleanup
        return () => window.removeEventListener('resize', handleResize)
    }, []) // Empty array ensures that effect is only run on mount and unmount

    return windowSize
}

export default useWindowSize
