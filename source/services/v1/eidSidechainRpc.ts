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

export default { getBlockHeight };