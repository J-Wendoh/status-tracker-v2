const fs = require('fs');
const csv = require('csv-parser');

console.log('🔍 Debugging CSV file...');

fs.createReadStream('AG Departmental Tracker - Copy of Sheet1.csv')
  .pipe(csv())
  .on('headers', (headers) => {
    console.log('📋 CSV Headers:', headers);
  })
  .on('data', (row) => {
    console.log('📄 Sample row:', row);
    return false; // Exit after first row
  })
  .on('end', () => {
    console.log('✅ CSV debug complete');
  });