const axios = require('axios');

const API_KEY =
  'd9b6a02d8bda1f6dafd2fbd91a356f8fda25d349f48b3725e2ad8f8bd2364590';
const getCryptoExchangeRateSingle = async (forCurrency) => {
  const response = await axios.get(
    `https://min-api.cryptocompare.com/data/price?fsym=${forCurrency}&tsyms=USD&api_key=${API_KEY}`
  );
  // console.log(response.data['USD']);
  return response.data['USD'];
};
const getCryptoExchangeRateMulti = async (forCurrencies) => {
  const response = await axios.get(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${forCurrencies}&tsyms=USD&api_key=${API_KEY}`
  );

  const transformedData = Object.fromEntries(
    Object.entries(response.data).map(([key, value]) => [key, value.USD])
  );
  // console.log(response.data);
  return transformedData;
};

const getCryptoExchangeRateSingleHistoric = async (forCurrency, timestamp) => {
  const response = await axios.get(
    `https://min-api.cryptocompare.com/data/pricehistorical?fsym=${forCurrency}&tsyms=USD&ts=${timestamp}&api_key=${API_KEY}`
  );
  // console.log('>>>>',response.data[forCurrency]['USD']);
  return response.data[forCurrency]['USD'];
};

module.exports = {
  getCryptoExchangeRateSingle,
  getCryptoExchangeRateMulti,
  getCryptoExchangeRateSingleHistoric,
};
