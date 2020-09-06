const { bsv, buildContractClass, getPreimage, toHex, num2bin, Bytes } = require('scryptlib');
const { DataLen, loadDesc, createUnlockingTx, createLockingTx, sendTx, showError  } = require('../helper');
const {
    privateKey
  } = require('../privateKey');



(async() => {
    try {
        /*const ReturnBonus = buildContractClass(loadDesc('returnbonus_desc.json'))
        
        let amount = 1000
        let getamount = 800
        //let getamount = BigInt(800)
        let offset = 0

        let nouts = 2
        const fee = 600 * nouts

        let buf = Buffer.alloc(100)
        let amountbin = num2bin(getamount, 8)
        buf.writeBigInt64LE(BigInt(getamount))
        offset += 8
        console.log("buf:", buf.subarray(0, offset).toString('hex'))
        let scripthex = "76a914828ca873fd2ae45eefe57a157d9600545b376cb888ac"
        let scriptbuf = Buffer.from(scripthex, 'hex')
        console.log("scriptbuf:", scriptbuf.toString('hex'))
        let lenScript = scriptbuf.length
        buf.writeUInt8(lenScript, offset)
        offset += 1
        console.log("buf:", buf.subarray(0, offset).toString('hex'))
        buf = buf.subarray(0, offset)
        buf = Buffer.concat([buf, scriptbuf])
        //buf.write(scriptbuf.toString('hex'), offset)
        offset += lenScript
        console.log("buf:", buf.subarray(0, offset).toString('hex'))
        //let newbuf = buf.subarray(0, offset)
        let hash = bsv.crypto.Hash.sha256sha256(buf)
        console.log("hash:", hash.toString('hex'), hash.length)

        //let hashOutput = "b'20 fce41a14022ab66e38f3a7c0ebd443803ebde89f9ee160c8436a66acc2341dc9'"

        let hashOutput = new Bytes(toHex(hash))
        console.log("hashOutput:", hashOutput)
        let bonus = new ReturnBonus(hashOutput)

        const lockingTx =  await createLockingTx(privateKey.toAddress(), amount, fee)
        for (let i = 0; i < nouts; i++) {
            lockingTx.outputs[i].setScript(bonus.lockingScript)
        }
        
        // lock fund to the script
        console.log("befor sigh lockingTx:", lockingTx)
        lockingTx.sign(privateKey)
        console.log("lockingTx:", lockingTx)
        let lockingTxid = await sendTx(lockingTx)
        console.log('funding txid:      ', lockingTxid)*/

        // unlock
        /*for (i = 0; i < 9; i++) {
            let prevLockingScript = counter.lockingScript.toASM();
            
            // update state
            counter.dataLoad = num2bin(i + 1, DataLen)
            const newLockingScript = counter.lockingScript.toASM();
            const newAmount = amount - FEE

            const unlockingTx = await createUnlockingTx(lockingTxid, amount, prevLockingScript, newAmount, newLockingScript)

            const preimage = getPreimage(unlockingTx, prevLockingScript, amount)
            const unlockingScript = counter.increment(new Bytes(toHex(preimage)), newAmount).toScript()
            unlockingTx.inputs[0].setScript(unlockingScript)

            lockingTxid = await sendTx(unlockingTx)
            console.log('iteration #' + i + ' txid: ', lockingTxid)

            amount = newAmount
        }*/

        console.log('Succeeded on testnet')
    } catch (error) {
        console.log('Failed on testnet')
        showError(error)
    }
})()