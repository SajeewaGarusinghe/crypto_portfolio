const { Worker } = require('worker_threads');
const fs = require('fs');
 
// const os = require('os');
const path = require('path');

const fileName = 'transactions.csv';
const balance = {};
const startTime = new Date();

// const numCPUs = os.cpus().length;
const numCPUs = 5;
const upto =30000000;
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

  const worker = new Worker(path.join(__dirname, 'worker.js'), {
    workerData: { fileName, fromLine: start,toLine:end },
  });

  worker.on('message', (result) => {
    // console.log(result);
    for (let token in result) {
      if (balance[token]) {
        balance[token]['value'] += result[token]['value'];
      } else {
        balance[token] = result[token];
      }
    }
  });

  worker.on('error', (err) => {
    console.error(err);
  });

  worker.on('exit', () => {
    workerCompleted++;

    if (workerCompleted === numCPUs) {
      console.log(balance);
      // console.log('Process Completed.');
      const end = new Date() - startTime;
      console.log('Execution time: %ds', end/1000);
    }
  });
}
