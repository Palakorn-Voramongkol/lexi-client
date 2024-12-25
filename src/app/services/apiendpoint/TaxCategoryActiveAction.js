import axios from 'axios'
const BASE_URL = process.env.REACT_APP_API_BASE_URL

export const getvuTaxCategory = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/json/vuTaxCategory_ActiveAction.json`);
        return response.data;
    } catch (error) {
        console.error('Error fetching getvuTaxCategory:', error);
        throw error;
    }
}
