const yargs = require('yargs');
const { getAllTokenBalance } = require('./getAllToken');
const { getSingleTokenBalance } = require('./getSingleToken');

yargs.command({
  command: 'token <token>',
  describe: 'log the latest portfolio value for given token in USD ',
  handler: function (argv) {
    console.log(
      `Please wait until we calculate latest portfolio value for token ${argv.token} in USD`
    );
    getSingleTokenBalance(argv.token);
  },
});

yargs.command({
  command: 'date <date>',
  describe:
    'log the portfolio value per token in USD on that date (node main.js balance_date ',
  handler: function (argv) {
    console.log(
      `Please wait until we calculate latest portfolio value until the date ${argv.date} in USD`
    );
  },
});

yargs.command({
  command: 'both <date> <token>',
  describe: 'log the portfolio value of that token in USD on that date',
  handler: function (argv) {
    console.log(`Date entered: ${argv.date}`);
    console.log(`Token entered: ${argv.token}`);
  },
});

yargs.command({
  command: '*',
  describe: 'Log the latest portfolio value per token in USD',
  handler: function () {
    console.log(
      'Please wait until we calculate latest portfolio value per token in USD '
    );
    getAllTokenBalance();
  },
});

yargs.parse();

//node main.js token BTC
// node main.js date 2022
// node main.js both 2022 ETH
//node main.js 
