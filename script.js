const curEl_one = document.getElementById('currency-one');
const amtEl_one = document.getElementById('amount-one');
const curEl_two = document.getElementById('currency-two');
const amtEl_two = document.getElementById('amount-two');

const rateEl = document.getElementById('rate');
const swap = document.getElementById('swap');
const ctx = document.getElementById('rate-chart').getContext('2d');

// Hardcoded gas prices for demonstration purposes
const currentGasPriceINR = 101.00; // Current gas price in INR
const historicalGasPriceINR = 95.00; // Historical gas price in INR (e.g., a year ago)
const historicalGasDate = '2023-06-23'; // Historical gas price date

// Fetch exchange rates and update the DOM
function calculate() {
    const currency_one = curEl_one.value;
    const currency_two = curEl_two.value;

    fetch(`https://api.exchangerate-api.com/v4/latest/${currency_one}`)
        .then(res => res.json())
        .then(data => {
            const rate = data.rates[currency_two];

            rateEl.innerText = `1 ${currency_one} = ${rate} ${currency_two}`;

            amtEl_two.value = (amtEl_one.value * rate).toFixed(2);
            fetchHistoricalRates(currency_one, currency_two);
            fetchInflationData(currency_one, currency_two, rate);
            updateGasPrices(rate);
        });
}

// Fetch historical exchange rates and update the chart
function fetchHistoricalRates(currency_one, currency_two) {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0];

    fetch(`https://api.exchangerate.host/timeseries?start_date=${startDate}&end_date=${endDate}&base=${currency_one}&symbols=${currency_two}`)
        .then(res => res.json())
        .then(data => {
            const labels = Object.keys(data.rates);
            const rates = Object.values(data.rates).map(rate => rate[currency_two]);

            updateChart(labels, rates, currency_one, currency_two);
        });
}

// Update the Chart.js chart with new data
function updateChart(labels, rates, currency_one, currency_two) {
    if (window.myChart) {
        window.myChart.destroy();
    }

    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `Exchange Rate (${currency_one} to ${currency_two})`,
                data: rates,
                borderColor: 'rgba(52, 152, 219, 1)',
                backgroundColor: 'rgba(52, 152, 219, 0.2)',
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'month'
                    },
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Exchange Rate'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Fetch inflation data and update the DOM
function fetchInflationData(currency_one, currency_two, rate) {
    const inflationRate = 4.5; // Example inflation rate, replace with actual API data

    updateInflationImpact(inflationRate, currency_one, currency_two, rate);
}

// Update the inflation impact section in the DOM
function updateInflationImpact(inflationRate, currency_one, currency_two, rate) {
    const inflationRateEl = document.getElementById('inflation-rate');
    const priceImpactEl = document.getElementById('price-impact');

    inflationRateEl.innerText = `Current Inflation Rate: ${inflationRate}%`;

    if (currency_one === 'INR' && currency_two === 'USD') {
        const impact = ((inflationRate / 100) * rate).toFixed(2);
        priceImpactEl.innerText = `Impact on Prices: 1 INR = ${impact} USD`;
    } else {
        priceImpactEl.innerText = `Impact on Prices: Not Applicable`;
    }
}

function fetchCrudeOilPrice() {
    fetch('https://api.oilpriceapi.com/v1/prices/latest', {
        headers: {
            'Authorization': 'Token YOUR_API_KEY'
        }
    })
        .then(response => response.json())
        .then(data => {
            crudeOilPriceEl.innerText = `Current Crude Oil Price: $${data.price} per barrel`;
        })
        .catch(error => {
            crudeOilPriceEl.innerText = 'Error fetching crude oil price';
        });
}

// Fetch headlines from the specified website
function fetchNewsHeadlines() {
    fetch('https://api.rss2json.com/v1/api.json?rss_url=https://energy.economictimes.indiatimes.com/rssfeeds/13358367.cms')
        .then(response => response.json())
        .then(data => {
            const headlines = data.items.map(item => `<li><a href="${item.link}" target="_blank">${item.title}</a></li>`);
            newsHeadlinesList.innerHTML = headlines.join('');
        })
        .catch(error => {
            newsHeadlinesList.innerText = 'Error fetching news headlines';
        });
}

// Event listeners
curEl_one.addEventListener('change', calculate);
amtEl_one.addEventListener('input', calculate);
curEl_two.addEventListener('change', calculate);
amtEl_two.addEventListener('input', calculate);

swap.addEventListener('click', () => {
    const temp = curEl_one.value;
    curEl_one.value = curEl_two.value;
    curEl_two.value = temp;
    calculate();
});

// Initial calculation
calculate();
fetchCrudeOilPrice();
fetchNewsHeadlines();