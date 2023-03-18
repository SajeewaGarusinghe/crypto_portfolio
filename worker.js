const { parentPort, workerData } = require('worker_threads');
const fs = require('fs');
const { parse } = require('csv-parse');

const { fileName, fromLine, toLine } = workerData;

const balance = {};

fs.createReadStream(fileName)
  .pipe(parse({ delimiter: ',', from_line: fromLine, to_line: toLine }))
  .on('data', function (row) {
    const timestamp = row[0];
    const transaction_type = row[1].toString();
    const token = row[2].toString();
    const amount = parseFloat(row[3]);

    if (balance[token]) {
      if (transaction_type == 'DEPOSIT') {
        balance[token]['value'] += amount;
      } else {
        balance[token]['value'] -= amount;
      }
    } else {
      if (transaction_type == 'DEPOSIT') {
        balance[token] = { value: amount };
      } else {
        balance[token] = { value: -amount };
      }
    }
  })
  .on('end', function () {
    parentPort.postMessage(balance);
  })
  .on('error', function (error) {
    console.error(error.message);
  });
