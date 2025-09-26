// PROGRAM TO GENERATE JWT TOKEN KEY (WHICH IS SIMPLY FOR JUST TESTING/PLACE-HOLDER)

import crypto from 'crypto'
const secret = crypto.randomBytes(64).toString('hex');
console.log(secret);