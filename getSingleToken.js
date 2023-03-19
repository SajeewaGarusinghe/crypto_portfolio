const { Worker } = require('worker_threads');
const fs = require('fs');
const { getCryptoExchangeRateSingle } = require('./apiCall');

// const os = require('os');
const path = require('path');

const fileName = 'transactions.csv';

// const numCPUs = os.cpus().length;
const getSingleTokenBalance = (token) => {
  let balance = 0;
  const startTime = new Date();
  const latestData = getCryptoExchangeRateSingle(token);
  // const numCPUs = os.cpus().length;
  const numCPUs = 6;
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

    const worker = new Worker(path.join(__dirname, 'singleTokenWorker.js'), {
      workerData: { fileName, tokenID: token, fromLine: start, toLine: end },
    });

    worker.on('message', (result) => {
      //  console.log(result);
      balance += result;
    });

    worker.on('error', (err) => {
      console.error(err);
    });

    worker.on('exit', () => {
      workerCompleted++;

      if (workerCompleted === numCPUs) {
        latestData
          .then((usd_rate) => {
            let portfolioValueInUSD = (usd_rate * balance).toFixed(1);
            // console.log(portfolioValueInUSD);
            console.log(`${token} : ${portfolioValueInUSD} $`);
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

module.exports = {
  getSingleTokenBalance,
};
