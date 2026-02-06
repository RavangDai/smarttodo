import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const BudgetChart = ({ data }) => {
    const chartData = {
        labels: data.categories || ['Rent', 'Groceries', 'Utilities', 'Entertainment', 'Savings'],
        datasets: [
            {
                label: 'Budget Breakdown',
                data: data.values || [1200, 400, 150, 200, 500],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: 'white'
                }
            },
            title: {
                display: true,
                text: 'Monthly Budget',
                color: 'white'
            },
        },
        scales: {
            y: {
                ticks: { color: 'white' },
                grid: { color: 'rgba(255,255,255,0.1)' }
            },
            x: {
                ticks: { color: 'white' },
                grid: { color: 'rgba(255,255,255,0.1)' }
            }
        }
    };

    return (
        <div className="w-full h-64 bg-gray-900/80 backdrop-blur-md p-4 rounded-xl border border-gray-700 shadow-xl">
            <Bar data={chartData} options={options} />
        </div>
    );
};

export default BudgetChart;
