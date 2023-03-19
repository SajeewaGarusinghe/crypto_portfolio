const { Worker } = require('worker_threads');
const fs = require('fs');
const { getCryptoExchangeRateMulti } = require('./apiCall');

const axios = require('axios');
const API_KEY =
  'd9b6a02d8bda1f6dafd2fbd91a356f8fda25d349f48b3725e2ad8f8bd2364590';

// const os = require('os');
const path = require('path');

const fileName = 'transactions.csv';

// const numCPUs = os.cpus().length;
const getAllTokenBalance = () => {
  const balance = {};
  const startTime = new Date();
  const latestData = getCryptoExchangeRateMulti('BTC,ETH,XRP');
  // const numCPUs = os.cpus().length;
  const numCPUs = 5;
  const upto = 30000000;
  const range = parseInt(upto / numCPUs);
  const addEnd = upto % numCPUs;

  let start = 2;
  let end = range;
  let temp = 0;

  let workerCompleted = 0;

  for (let i = 0; i <= numCPUs; i++) {
    if (i == 0) {
      i++;
    }
    if (temp == 0) {
      temp = range;
    } else if (temp > 0) {
      start = temp + 1;
      end = range * i;
      temp = end;
    }
    if (i == numCPUs) {
      end += addEnd;
    }
    // console.log(`start ${start}  end ${end}`);

    const worker = new Worker(path.join(__dirname, 'allTokenWorker.js'), {
      workerData: { fileName, fromLine: start, toLine: end },
    });

    worker.on('message', (result) => {
      // console.log(result);
      for (let token in result) {
        if (balance[token]) {
          balance[token] += result[token];
        } else {
          balance[token] = result[token];
        }
      }
    });

    worker.on('error', (err) => {
      console.error(err);
    });

    worker.on('exit', () => {
      workerCompleted++;

      if (workerCompleted === numCPUs) {
        latestData
          .then((usd_rates) => {
            let portfolioValueInUSD;
            for (let coin in balance) {
              portfolioValueInUSD = (balance[coin] * usd_rates[coin]).toFixed(
                1
              );
              console.log(`${coin} : ${portfolioValueInUSD} $`);
            }
          })
          .catch((e) => console.log(e.message, 'sajeewa'))
          .finally(() => {
            const end = new Date() - startTime;
            console.log('Execution time: %ds', end / 1000);
            console.log(balance);
          });

      }
    });
  }
};

//stable version

module.exports = {
  getAllTokenBalance,
};
