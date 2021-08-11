import mongoose from 'mongoose';
import cron from 'node-cron';
import config from '../../config/config';
import logging from '../../config/logging';
import rpcService from '../../services/v1/eidSidechainRpc';
import connMainnet from '../../connections/mainnet';
import connTestnet from '../../connections/testnet';
import sendNotification from '../../functions/sendNotification';

const NAMESPACE = 'Cron: EID Sidechain';

const Web3 = require('web3');

function publishDIDTx(network: string) {
    logging.info(NAMESPACE, `Started cronjob: publishDIDTx: ${network}`);

    const rpcUrl = network === config.blockchain.testnet ? config.blockchain.eidSidechain.testnet.rpcUrl : config.blockchain.eidSidechain.mainnet.rpcUrl;
    const contractAddress = network === config.blockchain.testnet ? config.blockchain.eidSidechain.testnet.contractAddress : config.blockchain.eidSidechain.mainnet.contractAddress;
    const chainId = network === config.blockchain.testnet ? config.blockchain.eidSidechain.testnet.chainId : config.blockchain.eidSidechain.mainnet.chainId;
    let web3 = new Web3(rpcUrl);

    const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;

    rpcService
        .getBlockHeight(network)
        .then((heightResponse) => {
            let currentHeight: number = heightResponse.data.height - 1;
            return currentHeight;
        })
        .then((height) => {
            let checkHeightDone = conn.models.LatestBlockchainState.findOne({ chain: config.blockchain.eidSidechain.name })
                .exec()
                .then((state) => {
                    let latestState =
                        state ||
                        new conn.models.LatestBlockchainState({
                            _id: new mongoose.Types.ObjectId(),
                            chain: config.blockchain.eidSidechain.name,
                            network,
                            extraInfo: {
                                rpcUrl,
                                contractAddress,
                                chainId
                            }
                        });
                    web3.eth
                        .getBlock(height)
                        .then((block: any) => {
                            return block;
                        })
                        .then((block: any) => {
                            latestState.height = height;
                            latestState.block = block;
                            latestState.save();
                        })
                        .catch((err: any) => {
                            logging.error(NAMESPACE, 'Error while getting the latest block from the blockchain: ', err);
                            return false;
                        });
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
            let pendingTxDone = conn.models.DidTx.find({ status: config.txStatus.pending })
                .exec()
                .then((didTxes) => {
                    didTxes.map((didTx, index) => {
                        let wallet = config.blockchain.eidSidechain.wallets.keystores[Math.floor(Math.random() * config.blockchain.eidSidechain.wallets.keystores.length)];
                        rpcService
                            .signTx(network, wallet, JSON.stringify(didTx.didRequest), index)
                            .then((res) => {
                                if (res.error) {
                                    logging.error(NAMESPACE, 'Error while publishing the a pending DID transaction to the blockchain: ', res.error);

                                    didTx.status = config.txStatus.cancelled;
                                    didTx.extraInfo = {
                                        error: res.error
                                    };
                                    didTx.save();
                                } else {
                                    web3.eth.sendSignedTransaction(res.txDetails['rawTx']).on('transactionHash', (transactionHash: string) => {
                                        didTx.status = config.txStatus.processing;
                                        didTx.blockchainTxHash = transactionHash;
                                        didTx.walletUsed = res.txDetails['walletUsed'];
                                        didTx.save();
                                    });
                                }
                            })
                            .catch((err) => {
                                logging.error(NAMESPACE, 'Error while publishing the a pending DID transaction to the blockchain: ', err);

                                didTx.status = config.txStatus.cancelled;
                                didTx.extraInfo = {
                                    error: err
                                };
                                didTx.save();
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
            let processingTxDone = conn.models.DidTx.find({ status: config.txStatus.processing })
                .exec()
                .then((didTxes) => {
                    didTxes.map((didTx) => {
                        web3.eth.getTransactionReceipt(didTx.blockchainTxHash).then((receipt: any) => {
                            if (!receipt) {
                                return;
                            }
                            didTx.blockchainTxReceipt = receipt;
                            if (receipt['status']) {
                                didTx.status = config.txStatus.completed;
                            } else {
                                didTx.status = config.txStatus.cancelled;
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
            logging.info(NAMESPACE, `Completed cronjob: publishDIDTx: ${network}`);
            setTimeout(() => {
                publishDIDTx(network);
            }, 5000);
        })
        .catch((err) => {
            logging.error(NAMESPACE, 'Error while trying to run the cronjob to publish DID txes: ', err);
        });
}

function dailyCronjob(network: string) {
    // TODO: Uncomment this when going to production
    //cron.schedule('0 0 * * * *', () => {

    cron.schedule('*/5 * * * * *', () => {
        logging.info(NAMESPACE, `Started cronjob: dailyCronjob: ${network}`);

        rpcService.getBalance(network, config.blockchain.eidSidechain.wallets.keystores[0].address).then((balanceResponse) => {
            console.log(balanceResponse);
        });

        const subject = 'Assist Service Daily Stats';
        const html = '<table><tr><th>Address</th><th>Balance</th><th>Type</th></tr>';

        //sendNotification.sendEmail(subject, config.smtpCreds.sender, html);

        const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;
        conn.models.User.find()
            .select('-password')
            .exec()
            .then((users) => {
                users.map((user) => {
                    user.requests.freeEndpoints.today = 0;
                    user.requests.premiumEndpoints.today = 0;
                    user.save();
                });
            })
            .catch((err) => {
                logging.error(NAMESPACE, 'Error while trying to reset daily limit for the users: ', err);
            });

        logging.info(NAMESPACE, `Completed cronjob: dailyCronjob: ${network}`);
    });
}

export default { publishDIDTx, dailyCronjob };
