const axios = require('axios');
const chalk = require('chalk');

const API_KEY =
  'd9b6a02d8bda1f6dafd2fbd91a356f8fda25d349f48b3725e2ad8f8bd2364590';
const getCryptoExchangeRateSingle = async (forCurrency) => {
  forCurrency = forCurrency.toUpperCase();

  try {
    const response = await axios.get(
      `https://min-api.cryptocompare.com/data/price?fsym=${forCurrency}&tsyms=USD&api_key=${API_KEY}`
    );
    // console.log(response.data['USD']);
    if (response.data['USD']) {
      return response.data['USD'];
    } else {
      logError('Invalid Token Entered');
      return undefined;
    }
  } catch (err) {
    logError('Please check the network connectivity and try Again !');
    return undefined;
  }
};
const getCryptoExchangeRateMulti = async (forCurrencies) => {
  try {
    const response = await axios.get(
      `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${forCurrencies}&tsyms=USD&api_key=${API_KEY}`
    );

    const transformedData = Object.fromEntries(
      Object.entries(response.data).map(([key, value]) => [key, value.USD])
    );
    // console.log(response.data);
    return transformedData;
  } catch (err) {
    logError('Please check the network connectivity and try Again !');
    return undefined;
  }
};

const getCryptoExchangeRateSingleHistoric = async (forCurrency, timestamp) => {
  forCurrency = forCurrency.toUpperCase();

  try {
    const response = await axios.get(
      `https://min-api.cryptocompare.com/data/pricehistorical?fsym=${forCurrency}&tsyms=USD&ts=${timestamp}&api_key=${API_KEY}`
    );
    // console.log('>>>>', response.data[forCurrency])

    if (response.data[forCurrency]) {
      return response.data[forCurrency]['USD'];
    } else {
      logError('Invalid Token Entered');
      return undefined;
    }
  } catch (err) {
    // console.log('Please check the network connectivity and try Again !');
    logError('Please check the network connectivity and try Again !');
    return undefined;
  }
};

function logError(err) {
  console.log(chalk.red(err));
}

module.exports = {
  getCryptoExchangeRateSingle,
  getCryptoExchangeRateMulti,
  getCryptoExchangeRateSingleHistoric,
};

 