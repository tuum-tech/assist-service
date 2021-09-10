import config from '../config/config';
import logging from '../config/logging';
import commonService from '../services/v1/common';
import Web3 from 'web3';

const NAMESPACE = 'Function: evmSidechain';

async function getBlockHeight(network: string, rpcUrl: string) {
    const web3 = new Web3(rpcUrl);
    const res: any = await web3.eth
        .getBlockNumber()
        .then((height: any) => {
            if (height) {
                const data = {
                    height
                };
                return commonService.returnSuccess(network, 200, data);
            } else {
                return commonService.returnError(network, 401, 'Could not get height');
            }
        })
        .catch((error: any) => {
            logging.error(NAMESPACE, 'Error while trying to get block height: ', error);

            return commonService.returnError(network, 500, error);
        });
    return res;
}

async function getBalance(network: string, rpcUrl: string, address: string) {
    const web3 = new Web3(rpcUrl);
    const res: any = await web3.eth
        .getBalance(web3.utils.toChecksumAddress(address))
        .then((value: any) => {
            if (value) {
                const data = {
                    value: Number(web3.utils.fromWei(value))
                };
                return commonService.returnSuccess(network, 200, data);
            } else {
                return commonService.returnError(network, 401, 'Could not get balance');
            }
        })
        .catch((error: any) => {
            logging.error(NAMESPACE, 'Error while trying to get balance of an address: ', error);

            return commonService.returnError(network, 500, error);
        });
    return res;
}

export default { getBlockHeight, getBalance };
