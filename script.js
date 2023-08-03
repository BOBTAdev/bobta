async function fetchBitcoinData() {
  const historicalUrl = 'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart';
  const currentDate = Math.floor(Date.now() / 1000);
  const twentyOneWeeksAgo = currentDate - 21 * 7 * 24 * 60 * 60; // 21 weeks in seconds

  try {
    const response = await fetch(`${historicalUrl}?vs_currency=usd&days=147&interval=daily`); // 147 days = 21 weeks

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    const prices = data.prices;

    // Calculate the 21-week moving average
    const movingAverage = prices.reduce((sum, priceData) => sum + priceData[1], 0) / prices.length;

    const currentPrice = prices[prices.length - 1][1];
    const isBullish = currentPrice > movingAverage;

    const statusElement = document.getElementById('statusText');
    const lastTimeElement = document.createElement('p');

    if (isBullish) {
      statusElement.textContent = `Current price of Bitcoin is Bullish: $${currentPrice.toFixed(2)}`;
      statusElement.classList.add('bullish');
      // Find the last occurrence when the price was below the moving average
      let lastTimeBelowMovingAverage = null;
      for (let i = prices.length - 1; i >= 0; i--) {
        if (prices[i][1] < movingAverage) {
          lastTimeBelowMovingAverage = new Date(prices[i][0]);
          break;
        }
      }
      if (lastTimeBelowMovingAverage) {
        lastTimeElement.textContent = `Last time Bitcoin price was Bearish: ${lastTimeBelowMovingAverage.toDateString()}`;
        lastTimeElement.classList.add('red-text');
      } else {
        lastTimeElement.textContent = 'Price has not been below the 21-week moving average in the past 21 weeks.';
        lastTimeElement.classList.add('red-text');
      }
    } else {
      statusElement.textContent = `Bearish: $${currentPrice.toFixed(2)}`;
      statusElement.classList.add('bearish');
      // Find the last occurrence when the price was above the moving average (bullish)
      let lastTimeAboveMovingAverage = null;
      for (let i = prices.length - 1; i >= 0; i--) {
        if (prices[i][1] > movingAverage) {
          lastTimeAboveMovingAverage = new Date(prices[i][0]);
          break;
        }
      }
      if (lastTimeAboveMovingAverage) {
        lastTimeElement.textContent = `Last time Bitcoin price was Bullish: ${lastTimeAboveMovingAverage.toDateString()}`;
        lastTimeElement.classList.add('green-text');
      } else {
        lastTimeElement.textContent = 'Price has not been above the 21-week moving average in the past 21 weeks.';
        lastTimeElement.classList.add('green-text');
      }
    }

    // Remove existing "lastTimeElement" before appending a new one
    const existingLastTimeElement = document.querySelector('.lastTimeElement');
    if (existingLastTimeElement) {
      existingLastTimeElement.parentNode.removeChild(existingLastTimeElement);
    }

    // Append the last time element
    lastTimeElement.classList.add('lastTimeElement');
    statusElement.parentNode.appendChild(lastTimeElement);

  } catch (error) {
    console.error('Error fetching data:', error);
    const statusElement = document.getElementById('statusText');
    statusElement.textContent = 'Error fetching data';
    statusElement.style.color = 'gray';
  }
}

// Function to fetch Bitcoin data and update the webpage
async function fetchAndUpdateBitcoinData() {
  const lastUpdatedElement = document.getElementById('lastUpdated');

  try {
    // Display the loading message while fetching data
    const statusElement = document.getElementById('statusText');
    statusElement.textContent = 'Loading...';

    await fetchBitcoinData();

    // Update the lastUpdatedElement with the current date and time
    const currentDate = new Date();
    const lastUpdatedText = `Last Updated: ${currentDate.toLocaleString()}`;
    lastUpdatedElement.textContent = lastUpdatedText;

  } catch (error) {
    console.error('Error fetching data:', error);
    const statusElement = document.getElementById('statusText');
    statusElement.textContent = 'Error fetching data';
    statusElement.style.color = 'gray';
  }

  // Call the function again after 5 minutes (300,000 milliseconds)
  setTimeout(fetchAndUpdateBitcoinData, 5 * 60 * 1000);
}

// Fetch Bitcoin data and update the webpage when the page loads
fetchAndUpdateBitcoinData();