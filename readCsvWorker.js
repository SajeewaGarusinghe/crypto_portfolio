const { parentPort, workerData } = require('worker_threads');
const fs = require('fs');
const { parse } = require('csv-parse');

const { filePath, fromLine, toLine } = workerData;

let balanceOnDate = {};
// let cumulativeBalance = {};

fs.createReadStream(filePath)
  .pipe(parse({ delimiter: ',', from_line: fromLine, to_line: toLine }))
  .on('data', function (row) {
    const date = new Date(row[0] * 1000).toLocaleDateString('en-ZA');

    if (!balanceOnDate[date]) {
      // Initialize portfolio balance for this date
      balanceOnDate[date] = {};
    }

    const transaction_type = row[1].toString();
    const token = row[2].toString();
    const amount = parseFloat(row[3]);

    if (transaction_type === 'DEPOSIT') {
      if (!balanceOnDate[date][token]) {
        // Initialize token balance for this date
        balanceOnDate[date][token] = 0;
      }
      balanceOnDate[date][token] += parseFloat(amount);
    } else if (transaction_type === 'WITHDRAWAL') {
      if (!balanceOnDate[date][token]) {
        // Initialize token balance for this date
        balanceOnDate[date][token] = 0;
      }
      balanceOnDate[date][token] -= parseFloat(amount);
    }
  })

  .on('end', function () {
    parentPort.postMessage(balanceOnDate);
    balanceOnDate = {};
  })
  .on('error', function (error) {
    console.error(error.message);
  });
