const { Table } = require('console-table-printer');

function startupTable() {
  const p = new Table();
  p.addRow(
    {
      Option: 1,
      Commands: 'latest',
      Arguments: '',
      Example: 'latest',
    },
    { color: 'yellow' }
  );
  p.addRow(
    {
      Option: 2,
      Commands: 'latest',
      Arguments: '--token=<token>',
      Example: 'latest --token=BTC',
    },
    { color: 'yellow' }
  );
  // p.addRow({ option: 2, text: 'green gemuse', value: 20.0 }, { color: 'green' });
  p.addRow(
    {
      Option: 3,
      Commands: 'date  ',
      Arguments: '--date=<date>',
      Example: 'date --date=2017/03/05',
    },
    { color: 'yellow' }
  );
  p.addRow(
    {
      Option: 4,
      Commands: 'date  ',
      Arguments: '--date=<YYYY/MM/DD> --token=<token>',
      Example: 'date --date=2017/03/05 --token=ETH',
    },
    { color: 'yellow' }
  );
  p.addRow(
    {
      Option: 5,
      Commands: 'close  ',
      Arguments: ' ',
      Example: 'close',
    },
    { color: 'yellow' }
  );
  p.printTable();
}

module.exports = {
  startupTable,
};
