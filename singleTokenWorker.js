const { parentPort, workerData } = require('worker_threads');
const fs = require('fs');
const { parse } = require('csv-parse');

const { fileName, tokenID, fromLine, toLine } = workerData;

let balance = 0;

fs.createReadStream(fileName)
  .pipe(parse({ delimiter: ',', from_line: fromLine, to_line: toLine }))
  .on('data', function (row) {
    const token = row[2].toString();
    if (token == tokenID) {
      // const timestamp = row[0];
      const transaction_type = row[1].toString();
      const amount = parseFloat(row[3]);

      if (transaction_type == 'DEPOSIT') {
        balance += amount;
      } else {
        balance -= amount;
      }
    }
  })
  .on('end', function () {
    parentPort.postMessage(balance);
  })
  .on('error', function (error) {
    console.error(error.message);
  });
