import React, { useEffect, useState } from 'react';
import { fetchNumbers } from '../services/numberService';

const NumberDisplay = () => {
    const [numbers, setNumbers] = useState({
        primes: [],
        fibo: [],
        even: [],
        rand: [],
    });

    useEffect(() => {
        const getNumbers = async () => {
            const primes = await fetchNumbers('primes');
            const fibo = await fetchNumbers('fibo');
            const even = await fetchNumbers('even');
            const rand = await fetchNumbers('rand');

            setNumbers({
                primes,
                fibo,
                even,
                rand,
            });
        };

        getNumbers();
    }, []);

    return (
        <div>
            <h2>Prime Numbers</h2>
            <ul>
                {numbers.primes.map((num, index) => (
                    <li key={index}>{num}</li>
                ))}
            </ul>

            <h2>Fibonacci Numbers</h2>
            <ul>
                {numbers.fibo.map((num, index) => (
                    <li key={index}>{num}</li>
                ))}
            </ul>

            <h2>Even Numbers</h2>
            <ul>
                {numbers.even.map((num, index) => (
                    <li key={index}>{num}</li>
                ))}
            </ul>

            <h2>Random Numbers</h2>
            <ul>
                {numbers.rand.map((num, index) => (
                    <li key={index}>{num}</li>
                ))}
            </ul>
        </div>
    );
};

export default NumberDisplay;
