import mongoose from 'mongoose';
import config from '../../config/config';
import logging from '../../config/logging';
import DidTx from '../../models/didTx';
import EidSidechainState from '../../models/eidSidechainState';
import rpcService from '../../services/v1/eidSidechainRpc';

const NAMESPACE = 'Cron: EID Sidechain';

const Web3 = require('web3');

function publishDIDTx() {
    logging.info(NAMESPACE, 'Started cronjob: publishDIDTx');

    let web3 = new Web3(config.blockchain.eidSidechain.rpcUrl);

    rpcService
        .getBlockHeight()
        .then((heightResponse) => {
            let currentHeight: number = heightResponse.height - 1;
            return currentHeight;
        })
        .then((height) => {
            let checkHeightDone = EidSidechainState.find({ height })
                .exec()
                .then((state) => {
                    if (state.length === 0) {
                        web3.eth
                            .getBlock(height)
                            .then((block: any) => {
                                return block;
                            })
                            .then((block: any) => {
                                const s = new EidSidechainState({
                                    _id: new mongoose.Types.ObjectId(),
                                    network: 'mainnet',
                                    height,
                                    block
                                });
                                s.save();
                            })
                            .catch((err: any) => {
                                logging.error(NAMESPACE, 'Error while getting the latest block from the blockchain: ', err);
                            });
                    }
                    return true;
                })
                .catch((err) => {
                    logging.error(NAMESPACE, 'Error while trying to retrieve latest state of the blockchain from the database: ', err);
                    return false;
                });
            return checkHeightDone;
        })
        .then((checkHeightDone) => {
            if (!checkHeightDone) {
                return false;
            }
            let pendingTxDone = DidTx.find({ status: 'Pending' })
                .exec()
                .then((didTxes) => {
                    didTxes.map((didTx, index) => {
                        rpcService.sendTx(config.blockchain.eidSidechain.wallets.wallet1, JSON.stringify(didTx.didRequest), index).then((txDetails: any) => {
                            web3.eth.sendSignedTransaction(txDetails['rawTx']).on('transactionHash', (transactionHash: string) => {
                                didTx.status = 'Processing';
                                didTx.blockchainTxHash = transactionHash;
                                didTx.walletUsed = txDetails['walletUsed'];
                                didTx.save();
                            });
                        });
                    });
                    return true;
                })
                .catch((err) => {
                    logging.error(NAMESPACE, 'Error while publishing the Pending DID transactions to the blockchain: ', err);
                    return false;
                });
            return pendingTxDone;
        })
        .then((pendingTxDone) => {
            if (!pendingTxDone) {
                return false;
            }
            let processingTxDone = DidTx.find({ status: 'Processing' })
                .exec()
                .then((didTxes) => {
                    didTxes.map((didTx) => {
                        web3.eth.getTransactionReceipt(didTx.blockchainTxHash).then((receipt: any) => {
                            if (!receipt) {
                                return;
                            }
                            didTx.blockchainTxReceipt = receipt;
                            if (receipt['status']) {
                                didTx.status = 'Completed';
                            } else {
                                didTx.status = 'Cancelled';
                                logging.error(NAMESPACE, 'Error while trying to publish DID transaction so changed its status to cancelled');
                            }
                            didTx.save();
                        });
                    });
                    return true;
                })
                .catch((err) => {
                    logging.error(NAMESPACE, 'Error while trying to process Processing DID transactions from the database: ', err);
                    return false;
                });
            return processingTxDone;
        })
        .then(() => {
            logging.info(NAMESPACE, 'Completed cronjob: publishDIDTx');
            setTimeout(publishDIDTx, 5000);
        })
        .catch((err) => {
            logging.error(NAMESPACE, 'Error while trying to run the cronjob to publish DID txes: ', err);
        });
}

export default { publishDIDTx };
