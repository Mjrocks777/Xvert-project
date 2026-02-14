import axios from 'axios'

const API_URL = 'http://localhost:8000/api/convert'

const historyService = {
    getHistory: async () => {
        try {
            const response = await axios.get(`${API_URL}/history`)
            return response.data // Expected { files: [...] }
        } catch (error) {
            console.error('Error fetching history:', error)
            throw error
        }
    }
}

export default historyService
