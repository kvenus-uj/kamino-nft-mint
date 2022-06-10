const fs = require('fs');
const idl = require('./idl/nft_staking.json');

fs.writeFileSync('./src/idl.json', JSON.stringify(idl));