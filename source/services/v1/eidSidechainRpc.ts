import config from '../../config/config';
import logging from '../../config/logging';

const NAMESPACE = 'Service: EID Sidechain';

const Web3 = require('web3');

async function getBlockHeight() {
        const web3 = new Web3(config.blockchain.eidSidechain.rpcUrl);
        const res: any = await web3.eth.getBlockNumber()
        .then((height: any ) => {
            if(height) {
                return {
                    _status: 'OK',
                    height
                }
            } else {
                return {
                        _status: 'ERR',
                        _error: {
                            code: 401,
                            message: 'Could not get height'
                        }
                }
            }
        })
        .catch((err: any) => {
            logging.error(NAMESPACE, 'Error while trying to get block height: ', err);

            return {
                _status: 'ERR',
                _error: {
                    code: 500,
                    message: err
                }
            }
        }); 
        return res;
}

async function sendTx(signedTx: any) {
    var Tx = require('@ethereumjs/tx').Transaction;
    var privateKey = Buffer.from('e331b6d69882b4cb4ea581d88e0b604039a3de5967688d3dcffdd2270c0fd109', 'hex');

    var rawTx = {
        nonce: '0x00',
        gasPrice: '0x09184e72a000',
        gasLimit: '0x2710',
        to: '0x0000000000000000000000000000000000000000',
        value: '0x00',
        data: '0x7f7465737432000000000000000000000000000000000000000000000000000000600057'
    }

    var tx = new Tx(rawTx, {'chain':'ropsten'});
    tx.sign(privateKey);

    var serializedTx = tx.serialize();

    // console.log(serializedTx.toString('hex'));
    // 0xf889808609184e72a00082271094000000000000000000000000000000000000000080a47f74657374320000000000000000000000000000000000000000000000000000006000571ca08a8bbf888cfa37bbf0bb965423625641fc956967b81d12e23709cead01446075a01ce999b56a8a88504be365442ea61239198e23d1fce7d00fcfc5cd3b44b7215f

    web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
    .on('receipt', console.log);

    const web3 = new Web3(config.blockchain.eidSidechain.rpcUrl);
        const res: any = await web3.eth.send_raw_transaction(signedTx)
        .then((height: any ) => {
            if(height) {
                return {
                    _status: 'OK',
                    height
                }
            } else {
                return {
                        _status: 'ERR',
                        _error: {
                            code: 401,
                            message: 'Could not get height'
                        }
                }
            }
        })
        .catch((err: any) => {
            logging.error(NAMESPACE, 'Error while trying to get block height: ', err);

            return {
                _status: 'ERR',
                _error: {
                    code: 500,
                    message: err
                }
            }
        }); 
        return res;
}


    def send_raw_transaction(self, signed_transaction):
        LOG.info("Sending transaction to the DID sidechain...")

        try:
            w3 = Web3(Web3.HTTPProvider(self.sidechain_rpc))
            tx = w3.eth.send_raw_transaction(signed_transaction.rawTransaction)
            return {
                "tx_id": tx.hex(),
                "error": None
            }
        except Exception as e:
            LOG.info(f"Error while sending transactions to the DID sidechain: {str(e)}")
            return {
                "tx_id": None,
                "error": str(e)
            }

export default { getBlockHeight };