const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const LEDGER_FILE = path.join(__dirname, '..', 'data', 'blockchain_ledger.json');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(LEDGER_FILE))) {
  fs.mkdirSync(path.dirname(LEDGER_FILE), { recursive: true });
}

// Load or initialize ledger
let ledger = [];
if (fs.existsSync(LEDGER_FILE)) {
  try {
    ledger = JSON.parse(fs.readFileSync(LEDGER_FILE, 'utf8'));
  } catch (err) {
    console.error('Error reading ledger, starting fresh.');
  }
}

if (ledger.length === 0) {
  // Genesis block
  ledger.push({
    index: 0,
    timestamp: new Date().toISOString(),
    previousHash: '0',
    data: 'Genesis Block',
    hash: crypto.createHash('sha256').update('Genesis Block').digest('hex')
  });
  saveLedger();
}

function saveLedger() {
  fs.writeFileSync(LEDGER_FILE, JSON.stringify(ledger, null, 2));
}

function getLatestBlock() {
  return ledger[ledger.length - 1];
}

/**
 * Anchors a document hash to the simulated blockchain
 * @param {string} documentHash The SHA-256 hash of the certificate
 * @param {string} certificateId The ID of the certificate
 * @returns {object} The transaction receipt/block info
 */
function anchorToBlockchain(documentHash, certificateId) {
  const previousBlock = getLatestBlock();
  const nextIndex = previousBlock.index + 1;
  const timestamp = new Date().toISOString();
  
  const blockData = {
    certificateId,
    documentHash,
    event: 'DOCUMENT_ISSUED'
  };

  const blockString = `${nextIndex}${previousBlock.hash}${timestamp}${JSON.stringify(blockData)}`;
  const blockHash = crypto.createHash('sha256').update(blockString).digest('hex');

  const newBlock = {
    index: nextIndex,
    timestamp,
    previousHash: previousBlock.hash,
    data: blockData,
    hash: blockHash
  };

  ledger.push(newBlock);
  saveLedger();

  return {
    txHash: blockHash,
    blockNumber: nextIndex,
    timestamp
  };
}

/**
 * Verify if a document hash exists on the blockchain and is untampered
 * @param {string} documentHash 
 * @returns {boolean} 
 */
function verifyOnBlockchain(documentHash) {
  const block = ledger.find(b => b.data && b.data.documentHash === documentHash);
  if (!block) return false;

  // Re-verify block integrity
  const blockString = `${block.index}${block.previousHash}${block.timestamp}${JSON.stringify(block.data)}`;
  const calculatedHash = crypto.createHash('sha256').update(blockString).digest('hex');
  
  return calculatedHash === block.hash;
}

module.exports = {
  anchorToBlockchain,
  verifyOnBlockchain,
  getLedger: () => ledger
};
