const { parentPort, workerData, Worker } = require('worker_threads');
const fs = require('fs');
const { parse } = require('csv-parse');

const { fileName, time_stamp, fromLine, toLine, workerIndex } = workerData;
const balance = {};
let postMessageCount = 0;

fs.createReadStream(fileName)
  .pipe(parse({ delimiter: ',', from_line: fromLine, to_line: toLine }))
  .on('data', function (row) {
    const timestamp = +row[0];

    if (timestamp <= +time_stamp) {
      const transaction_type = row[1].toString();
      const token = row[2].toString();
      const amount = parseFloat(row[3]);

      if (balance[token]) {
        if (transaction_type == 'DEPOSIT') {
          balance[token] += amount;
        } else {
          balance[token] -= amount;
        }
      } else {
        if (transaction_type == 'DEPOSIT') {
          balance[token] = amount;
        } else {
          balance[token] = -amount;
        }
      }
    } else {
      if (postMessageCount < 1) {
        console.log('came here>>>>>');
        parentPort.postMessage({
          result: balance,
          terminateBegin: workerIndex,
        });

        postMessageCount++;
      }
    }
  })
  .on('end', function () {
    // console.log('done sajeewa');
    // console.log(workerIndex);
    // console.log(balance);
    parentPort.postMessage({ result: balance });
  })
  .on('error', function (error) {
    console.error(error.message);
  });

//1571966194
