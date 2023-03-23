const { parentPort, workerData } = require('worker_threads');
const fs = require('fs');
const { parse } = require('csv-parse');

const { filePath, fromLine, toLine } = workerData;

let balanceOnDate = {};

fs.createReadStream(filePath)
  .pipe(parse({ delimiter: ',', from_line: fromLine, to_line: toLine }))
  .on('data', function (row) {
    //create date key from timestamp received from csv
    const date = new Date(row[0] * 1000).toLocaleDateString('en-ZA');

    //following done for in case of balanceOnDate[date] is not defined...otherwise error may occur
    if (!balanceOnDate[date]) {
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
    //at the end of the assigned files reading worker will write that data to main
    parentPort.postMessage(balanceOnDate);
    //clearing that memory
    balanceOnDate = {};
  })
  //execute following if error occur while reading csv
  .on('error', function (error) {
    console.error(error.message);
  });
