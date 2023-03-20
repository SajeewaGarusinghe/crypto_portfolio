const { parentPort, workerData, Worker } = require('worker_threads');
const fs = require('fs');
const { parse } = require('csv-parse');

const { fileName, time_stamp, fromLine, toLine, workerIndex, tokenID } =
  workerData;
let balance = 0;
let postMessageCount = 0;

fs.createReadStream(fileName)
  .pipe(parse({ delimiter: ',', from_line: fromLine, to_line: toLine }))
  .on('data', function (row) {
    const timestamp = +row[0];

    if (timestamp <= +time_stamp) {
      const token = row[2].toString();

      if (token == tokenID) {
        const transaction_type = row[1].toString();
        const amount = parseFloat(row[3]);

        if (transaction_type == 'DEPOSIT') {
          balance += amount;
        } else {
          balance -= amount;
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
