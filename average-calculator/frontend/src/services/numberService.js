import axios from 'axios';

// Replace with your actual access token
const accessToken = VITE_API_URL;

// Map URL for different number types
const urlMap = {
    primes: 'http://20.244.56.144/evaluation-service/primes',
    fibo: 'http://20.244.56.144/evaluation-service/fibo',
    even: 'http://20.244.56.144/evaluation-service/even',
    rand: 'http://20.244.56.144/evaluation-service/rand',
};

// Function to fetch numbers based on type
export const fetchNumbers = async (type) => {
    try {
        const response = await axios.get(urlMap[type], {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });
        return response.data.numbers;
    } catch (error) {
        console.error(`Error fetching ${type} numbers:`, error);
        return [];
    }
};
