import axios from 'axios'
const BASE_URL = process.env.REACT_APP_API_BASE_URL


export const getvuLineItem_ALL_gbClientCode = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/json/vuLineItem_ALL_gbClientCode.json`)
        return response.data
    } catch (error) {
        console.error('Error fetching vuLineItem_ALL_gbClientCode:', error)
        throw error
    }
}

export const getvuLineItem_ALL_gbManualTaxCat = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/json/vuLineItem_ALL_gbManualTaxCat.json`)
        return response.data
    } catch (error) {
        console.error('Error fetching vuLineItem_ALL_gbManualTaxCat:', error)
        throw error
    }
}