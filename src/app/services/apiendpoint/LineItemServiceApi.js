import axios from 'axios'
const BASE_URL = process.env.REACT_APP_API_BASE_URL

export const getvuLineItem_Queue = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/json/vuLineItem_Queue.json`)
        return response.data
    } catch (error) {
        console.error('Error fetching vuLineItem_Queue:', error)
        throw error
    }
}
export const getvuLineItem_Done = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/json/vuLineItem_Done.json`)
        return response.data
    } catch (error) {
        console.error('Error fetching vuLineItem_Done:', error)
        throw error
    }
}
export const getvuLineItem_ALL = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/json/vuLineItem_ALL.json`)        
        return response.data
    } catch (error) {
        console.error('Error fetching vuLineItem_ALL:', error)
        throw error
    }
}