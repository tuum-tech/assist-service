import mongoose from 'mongoose';
import config from '../../config/config';
import logging from '../../config/logging';
import didTx from '../../models/didTx';
import DidTx from '../../models/didTx';
import rpcService from '../../services/v1/eidSidechainRpc';

const NAMESPACE = 'Cron: EID Sidechain';

const Web3 = require('web3');

function publishDIDTx() {
    logging.info(NAMESPACE, 'Started cronjob: publishDIDTx');

    rpcService.getBlockHeight().then((res) => {
        console.log(`heightResponse: ${JSON.stringify(res)}`);
    });

    let web3 = new Web3(config.blockchain.eidSidechain.rpcUrl);

    DidTx.find({ status: 'Pending' })
        .exec()
        .then((didTxes) => {
            didTxes.map((didTx) => {
                rpcService.sendTx(config.blockchain.eidSidechain.wallets.wallet1, JSON.stringify(didTx.didRequest)).then((txDetails: any) => {
                    console.log('txDetails: ', txDetails);

                    web3.eth
                        .sendSignedTransaction(txDetails['rawTx'])
                        .on('transactionHash', (transactionHash: string) => {
                            console.log('transactionHash:', transactionHash);
                            didTx.status = 'Processing';
                            didTx.blockchainTxHash = transactionHash;
                            didTx.walletUsed = txDetails['walletUsed'];
                            didTx.save();
                        })
                        .catch((err: any) => {
                            logging.error(NAMESPACE, 'Error while trying to publish DID transaction: ', err);
                        });
                });
            });
        })
        .catch((err) => {
            logging.error(NAMESPACE, 'Error while trying to retrieve DID transactions from the database: ', err);
        });

    DidTx.find({ status: 'Processing' })
        .exec()
        .then((didTxes) => {
            didTxes.map((didTx) => {
                web3.eth
                    .getTransactionReceipt(didTx.blockchainTxHash)
                    .then((receipt: any) => {
                        console.log('receipt:', receipt);
                        didTx.blockchainTxReceipt = receipt;
                        if (receipt['status']) {
                            didTx.status = 'Completed';
                        } else {
                            didTx.status = 'Cancelled';
                            logging.error(NAMESPACE, 'Error while trying to publish DID transaction so it was cancelled');
                        }
                        didTx.save();
                    })
                    .catch((err: any) => {
                        logging.error(NAMESPACE, 'Error while trying to get transaction receipt from the given hash: ', err);
                    });
            });
        })
        .catch((err) => {
            logging.error(NAMESPACE, 'Error while trying to retrieve DID transactions from the database: ', err);
        });

    logging.info(NAMESPACE, 'Completed cronjob: publishDIDTx');

    setTimeout(publishDIDTx, 5000);
}

export default { publishDIDTx };
