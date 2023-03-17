var fs = require('fs');
var { parse } = require('csv-parse');

var start = new Date();

// const fileName = 'transactions.csv';
const fileName = './files/sample.csv';

const balance = {};

fs.createReadStream(fileName)
  .pipe(parse({ delimiter: ',', from_line: 2 }))
  .on('data', function (row) {
    let timestamp = row[0];
    let transaction_type = row[1].toString();
    let token = row[2].toString();
    let amount = parseFloat(row[3]);
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
    console.log(balance);
    console.log('Process Completed.');
    var end = new Date() - start;
    console.log('Execution time: %dms', end);
  })
  .on('error', function (error) {
    console.error(error.message);
  });
