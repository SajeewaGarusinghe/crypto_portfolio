const { Worker } = require('worker_threads');
const fs = require('fs');
const path = require('path');
const os = require('os');
const numCPUs = parseInt(os.cpus().length / 2) || 4;

const upto = 30000000; //application is currently optimize for reading this num of records.that doesn't mean it only read upto this num of records
// process.env.UV_THREADPOOL_SIZE = 8;
const balanceOnDates = {};

// Function that reads a CSV file and processes the data
function readCsvFile(filePath) {
  return new Promise((resolve, reject) => {
    const startTime = new Date();
    const range = parseInt(upto / numCPUs);
    // const addEnd = upto % numCPUs;

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
        // end += addEnd;
        end = undefined; //by doing this we can expand last worker to read all the left data
      }

      const worker = new Worker(path.join(__dirname, 'readCsvWorker.js'), {
        workerData: { filePath, fromLine: start, toLine: end },
      });

      worker.on('message', (balanceOnDate) => {
        for (let date in balanceOnDate) {
          if (!balanceOnDates[date]) {
            balanceOnDates[date] = { ...balanceOnDate[date] };
          } else {
            for (let currency in balanceOnDate[date]) {
              balanceOnDates[date][currency] =
                (balanceOnDates[date][currency] || 0) +
                balanceOnDate[date][currency];
            }
          }
        }
      });

      worker.on('error', (err) => {
        reject(err);
      });

      worker.on('exit', () => {
        workerCompleted++;

        if (workerCompleted === numCPUs) {
          let cumulativeBalances = {};
          let cumulativeBalance = {};
          const dates = Object.keys(balanceOnDates).sort((a, b) => {
            return new Date(a) - new Date(b);
          });

          dates.forEach((date) => {
            const balance = balanceOnDates[date];
            Object.keys(balance).forEach((coin) => {
              if (cumulativeBalance[coin]) {
                cumulativeBalance[coin] += balance[coin];
              } else {
                cumulativeBalance[coin] = balance[coin];
              }
            });
            cumulativeBalances[date] = { ...cumulativeBalance };
          });

          const end = new Date() - startTime;
          console.log('\ninitial Loading time: %ds', end / 1000);
          resolve({ results: cumulativeBalances, cumulativeBalance });
        }
      });
    }
  });
}

module.exports = {
  readCsvFile,
};
