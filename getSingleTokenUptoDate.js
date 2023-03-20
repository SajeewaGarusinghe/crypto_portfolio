const { Worker } = require('worker_threads');
const fs = require('fs');
const { getCryptoExchangeRateSingleHistoric } = require('./apiCall');

const API_KEY =
  'd9b6a02d8bda1f6dafd2fbd91a356f8fda25d349f48b3725e2ad8f8bd2364590';

const path = require('path');

const fileName = 'transactions.csv';
const workers = [];

const getSingleTokenUptoDate = (time_stamp, tokenID) => {
  let balance = 0;
  const startTime = new Date();
  const latestData = getCryptoExchangeRateSingleHistoric(tokenID, time_stamp);

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

    const worker = new Worker(
      path.join(__dirname, 'singleTokenUptoDateWorker.js'),
      {
        workerData: {
          fileName,
          time_stamp,
          fromLine: start,
          toLine: end,
          workerIndex: i - 1,
          tokenID,
        },
      }
    );
    workers.push(worker);
 

    worker.on('message', ({ result, terminateBegin }) => {
      if (terminateBegin) {
        for (j = terminateBegin; j < numCPUs; j++) {
          workerCompleted++;
          workers[j].terminate();
        }
      }

      // console.log('balance>>', result);
      // console.log('terminateBegin>>', terminateBegin);
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
            let portfolioValueInUSD = (balance * usd_rate).toFixed(1);
            console.log(`${tokenID} : ${portfolioValueInUSD} $`);
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
  getSingleTokenUptoDate,
};
