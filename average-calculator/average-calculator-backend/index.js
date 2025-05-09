const axios = require('axios');

// Store the authorization token once
const accessToken = VITE_ACCESS_TOKEN; 

// Function to fetch numbers from different APIs
async function fetchNumbers(type) {
    const urlMap = {
        primes: 'http://20.244.56.144/evaluation-service/primes',
        fibo: 'http://20.244.56.144/evaluation-service/fibo',
        even: 'http://20.244.56.144/evaluation-service/even',
        rand: 'http://20.244.56.144/evaluation-service/rand',
    };

    try {
        const response = await axios.get(urlMap[type], {
            headers: {
                'Authorization': `Bearer ${accessToken}` // Use the token here
            }
        });
        console.log(`${type.charAt(0).toUpperCase() + type.slice(1)} Numbers:`, response.data.numbers);
    } catch (error) {
        console.error(`Error fetching ${type} numbers:`, error);
    }
}

// Fetch all types of numbers
async function fetchAllNumbers() {
    await fetchNumbers('primes');
    await fetchNumbers('fibo');
    await fetchNumbers('even');
    await fetchNumbers('rand');
}

// Call the function
fetchAllNumbers();
