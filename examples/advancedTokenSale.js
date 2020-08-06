const {
  bsv,
  buildContractClass,
  getPreimage,
  toHex,
  num2bin,
  Bytes,
  signTx,
  Ripemd160
} = require('scryptjs');
const {
  DataLen,
  loadDesc,
  createLockingTx,
  sendTx,
  showError,
  unlockP2PKHInput
} = require('../helper');
const {
  privateKey,
  genPrivKey
} = require('../privateKey');

const Signature = bsv.crypto.Signature
const sighashType = Signature.SIGHASH_ANYONECANPAY | Signature.SIGHASH_ALL | Signature.SIGHASH_FORKID

// Token price is 1000 satoshis each
// NOTE: a price that is too low could run afoul of dust policy
const satsPerToken = 1000

// one iteration per buyer
const boughtEachIteration = [1, 3, 5, 7, 9]
const numIterations = boughtEachIteration.length

// private keys of buyers - on testnet in WIF
const key1 = 'cUA2uny6KA5NHvEVGwUV7L9nrvzXxmZ1z2j1BedGhFDZWKCb4Dss'
const key2 = 'cTGJeonhAxghP177iPf247wmAuejuzm9U1cVN7RLpuFQoYZK9qZS'
const key3 = 'cTwTxXARU4dp82edX6tDGb87ATA48ZQJzZfjHZQuU63waPdKvKLj'
const key4 = 'cPSdEiJu3UXQnj9uZc1yrQNt8hp9bjuq7AJihXo9xRakVb5s8ktu'
const key5 = 'cTkC6Xi4PGog1LnyvANq2xj4jmjRwyG6nQXEtvAxb9UM6cpYbqcb'
if (!key1 || !key2 || !key3 || !key4 || !key5) {
  console.log('You must provide private keys to purchase tokens')
  genPrivKey()
}

const privateKeys = [key1, key2, key3, key4, key5].map(k => new bsv.PrivateKey.fromWIF(k))
const publicKeys = new Array(privateKeys.length)
// PKHs for receiving change from each transaction (20 bytes - 40 hexadecimal characters)
const pkhs = new Array(privateKeys.length)

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  try {
    // generate public keys, and PKHs
    for (k = 0; k < privateKeys.length; k++) {
      publicKeys[k] = bsv.PublicKey.fromPrivateKey(privateKeys[k])
      pkhs[k] = bsv.crypto.Hash.sha256ripemd160(publicKeys[k].toBuffer())
    }

    // get locking script
    const AdvancedTokenSale = buildContractClass(loadDesc('advancedTokenSale_desc.json'))
    const advTokenSale = new AdvancedTokenSale(satsPerToken)

    // append state as passive data
    advTokenSale.dataLoad = '00'

    // initial contract funding - arbitrary amount
    let amount = 1000
    const FEE = amount

    // lock funds to the script
    // const lockingTx = await createLockingTx(privateKey.toAddress(), amount)
    // lockingTx.outputs[0].setScript(advTokenSale.lockingScript)
    // lockingTx.sign(privateKey)
    // let lockingTxid = await sendTx(lockingTx)
    // console.log('funding txid:      ', lockingTxid)
    let lockingTxid = '2e2d7615521fbc1a049d48fd43d32526d9509800ce7c82bb39a4253c2336cf1f'

    // Run five transactions /iterations
    for (i = 0; i < numIterations; i++) {
      // avoid mempool conflicts
      // sleep to allow previous tx to "sink-into" the network
      console.log('==============================')
      console.log('Sleeping before iteration ', i)
      console.log('------------------------------')
      await sleep(9000);

      const prevLockingScript = advTokenSale.lockingScript

      const numBought = boughtEachIteration[i]
      const numBoughtHex = num2bin(1, DataLen)
      const spendAmount = numBought * satsPerToken

      // build-up a list of sales
      advTokenSale.dataLoad += toHex(publicKeys[i]) + numBoughtHex

      // Increase contract funding to match proceeds from sale
      // The contract expects/enforces this
      const newAmount = amount + spendAmount

      // const unlockingTx = await createUnlockingTx(lockingTxid, amount, prevLockingScript.toASM(), newAmount, advTokenSale.lockingScript.toASM())
      const unlockingTx = await createLockingTx(privateKeys[i].toAddress(), newAmount, FEE)
      unlockingTx.outputs[0].setScript(advTokenSale.lockingScript)

      // add input point to prevTx
      unlockingTx.addInput(new bsv.Transaction.Input({
        prevTxId: lockingTxid,
        outputIndex: 0,
        script: new bsv.Script(), // placeholder
      }), prevLockingScript, amount)
      
      const curInputIndex = unlockingTx.inputs.length - 1

      const changeAmount = unlockingTx.inputAmount - FEE - newAmount

      const preimage = getPreimage(unlockingTx, prevLockingScript.toASM(), amount, curInputIndex, sighashType)

      const unlockingScript = advTokenSale.buy(
        new Bytes(toHex(preimage)), // sighashPreimage
        new Ripemd160(toHex(pkhs[i])), // changePKH
        changeAmount, // changeSats
        new Bytes(toHex(publicKeys[i])), // buyer's public key
        numBought // number of tokens purchased
      ).toScript()

      // unlock other p2pkh inputs
      for (let i = 0; i < curInputIndex; i++) {
        unlockP2PKHInput(privateKey, unlockingTx, i, sighashType)
      }

      // unlock contract input
      unlockingTx.inputs[curInputIndex].setScript(unlockingScript)

      lockingTxid = await sendTx(unlockingTx)
      console.log('iteration #' + i + ' txid: ', lockingTxid)

      // preserve for next iteration
      amount = newAmount
    }

    console.log('Succeeded on testnet')
  } catch (error) {
    console.log('Failed on testnet')
    showError(error)
    console.log(error.context)
  }
})()