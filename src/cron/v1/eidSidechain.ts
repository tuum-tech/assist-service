import mongoose from 'mongoose';
import cron from 'node-cron';
import config from '../../config/config';
import logging from '../../config/logging';
import rpcService from '../../services/v1/eidSidechainRpc';
import connMainnet from '../../connections/mainnet';
import connTestnet from '../../connections/testnet';
import sendNotification from '../../functions/sendNotification';
import userStats from '../../functions/stats/user';
import eidSidechainStats from '../../functions/stats/eidSidechain';
import Web3 from 'web3';

const NAMESPACE = 'Cron: EID Sidechain';

// function publishDIDTx(network: string) {
//     // * * * * * * format = second minute hour dayofmonth month dayofweek
//     cron.schedule(
//         '*/5 * * * * *',
//         () => {
//             logging.info(NAMESPACE, `Started cronjob: publishDIDTx: ${network}`);

//             const rpcUrl = network === config.blockchain.testnet ? config.blockchain.eidSidechain.testnet.rpcUrl : config.blockchain.eidSidechain.mainnet.rpcUrl;
//             const backupRpcUrl = network === config.blockchain.testnet ? config.blockchain.eidSidechain.testnet.backupRpcUrl : config.blockchain.eidSidechain.mainnet.backupRpcUrl;
//             const chainId = network === config.blockchain.testnet ? config.blockchain.eidSidechain.testnet.chainId : config.blockchain.eidSidechain.mainnet.chainId;
//             const genesisBlockHash = network === config.blockchain.testnet ? config.blockchain.eidSidechain.testnet.genesisBlockHash : config.blockchain.eidSidechain.mainnet.genesisBlockHash;
//             const depositAddress = network === config.blockchain.testnet ? config.blockchain.eidSidechain.testnet.depositAddress : config.blockchain.eidSidechain.mainnet.depositAddress;
//             const withdrawContractAddress =
//                 network === config.blockchain.testnet ? config.blockchain.eidSidechain.testnet.withdrawContractAddress : config.blockchain.eidSidechain.mainnet.withdrawContractAddress;
//             const didContractAddress = network === config.blockchain.testnet ? config.blockchain.eidSidechain.testnet.didContractAddress : config.blockchain.eidSidechain.mainnet.didContractAddress;

//             const web3 = new Web3(rpcUrl);

//             const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;

//             rpcService
//                 .getBlockHeight(network)
//                 .then((heightResponse) => {
//                     const currentHeight: number = heightResponse.data.height - 1;
//                     return currentHeight;
//                 })
//                 .then((height) => {
//                     const checkHeightDone = conn.models.LatestBlockchainState.findOne({ chain: config.blockchain.eidSidechain.name })
//                         .exec()
//                         .then((state) => {
//                             const latestState =
//                                 state ||
//                                 new conn.models.LatestBlockchainState({
//                                     _id: new mongoose.Types.ObjectId(),
//                                     chain: config.blockchain.eidSidechain.name,
//                                     network
//                                 });
//                             web3.eth
//                                 .getBlock(height)
//                                 .then((block: any) => {
//                                     return block;
//                                 })
//                                 .then((block: any) => {
//                                     latestState.height = height;
//                                     latestState.block = block;
//                                     latestState.miner = 'TBD';
//                                     latestState.validator = {
//                                         name: 'TBD',
//                                         rank: Infinity,
//                                         ownerKey: 'TBD',
//                                         nodeKey: 'TBD',
//                                         location: 'TBD',
//                                         url: 'TBD',
//                                         ip: 'TBD'
//                                     };
//                                     latestState.avgTxHourly = Infinity;
//                                     latestState.accountsOverOneELA = Infinity;
//                                     latestState.numTx = block.transactions.length;
//                                     latestState.extraInfo = {
//                                         rpcUrl,
//                                         backupRpcUrl,
//                                         chainId,
//                                         genesisBlockHash,
//                                         depositAddress,
//                                         withdrawContractAddress,
//                                         didContractAddress
//                                     };
//                                     latestState.save();
//                                 })
//                                 .catch((err: any) => {
//                                     logging.error(NAMESPACE, 'Error while getting the latest block from the blockchain: ', err);
//                                     return false;
//                                 });
//                             return true;
//                         })
//                         .catch((err) => {
//                             logging.error(NAMESPACE, 'Error while trying to retrieve latest state of the blockchain from the database: ', err);
//                             return false;
//                         });
//                     return checkHeightDone;
//                 })
//                 .then((checkHeightDone) => {
//                     if (!checkHeightDone) {
//                         return;
//                     }
//                     conn.models.DidTx.find({ status: config.txStatus.pending })
//                         .exec()
//                         .then((didTxes) => {
//                             const newKeystores = [...config.blockchain.eidSidechain.wallets.keystores];
//                             didTxes.map((didTx, index) => {
//                                 if (didTx.walletUsed) {
//                                     const i = newKeystores.indexOf(didTx.walletUsed);
//                                     if (i !== -1) {
//                                         newKeystores.splice(i, 1);
//                                     }
//                                 } else {
//                                     const wallet = newKeystores[Math.floor(Math.random() * newKeystores.length)];
//                                     logging.info(NAMESPACE, `Using wallet ${wallet.address} to publish ${didTx.did}`);
//                                     rpcService
//                                         .signTx(network, wallet, JSON.stringify(didTx.didRequest), index)
//                                         .then((res) => {
//                                             didTx.walletUsed = res.txDetails.walletUsed;
//                                             didTx.save();
//                                             if (res.error) {
//                                                 logging.error(NAMESPACE, 'Error while publishing the a pending DID transaction to the blockchain: ', res.error);

//                                                 didTx.status = config.txStatus.cancelled;
//                                                 didTx.extraInfo = {
//                                                     error: res.error
//                                                 };
//                                                 didTx.save();
//                                             } else {
//                                                 web3.eth.sendSignedTransaction(res.txDetails.rawTx).on('transactionHash', (transactionHash: string) => {
//                                                     didTx.status = config.txStatus.processing;
//                                                     didTx.blockchainTxHash = transactionHash;
//                                                     didTx.save();
//                                                 });
//                                             }
//                                         })
//                                         .catch((error: any) => {
//                                             logging.error(NAMESPACE, 'Error while publishing the a pending DID transaction to the blockchain: ', error);

//                                             didTx.status = config.txStatus.cancelled;
//                                             didTx.extraInfo = {
//                                                 error: error.toString()
//                                             };
//                                             didTx.save();
//                                         });
//                                 }
//                             });
//                         })
//                         .catch((err) => {
//                             logging.error(NAMESPACE, 'Error while publishing the Pending DID transactions to the blockchain: ', err);
//                         });
//                 })
//                 .then(() => {
//                     conn.models.DidTx.find({ status: config.txStatus.processing })
//                         .exec()
//                         .then((didTxes) => {
//                             didTxes.map((didTx) => {
//                                 web3.eth.getTransactionReceipt(didTx.blockchainTxHash, (err, txReceipt) => {
//                                     logging.info(NAMESPACE, `${didTx.did}: ${txReceipt}`);
//                                     if (!txReceipt) {
//                                         didTx.extraInfo = {
//                                             error: err
//                                         };
//                                         didTx.save();
//                                         return;
//                                     }
//                                     didTx.blockchainTxReceipt = txReceipt;
//                                     if (txReceipt.status) {
//                                         didTx.status = config.txStatus.completed;
//                                     } else {
//                                         didTx.status = config.txStatus.cancelled;
//                                         didTx.extraInfo = {
//                                             error: err
//                                         };
//                                         logging.error(NAMESPACE, 'Error while trying to publish DID transaction so changed its status to cancelled');
//                                     }
//                                     didTx.save();
//                                 });
//                             });
//                         })
//                         .catch((err) => {
//                             logging.error(NAMESPACE, 'Error while trying to process Processing DID transactions from the database: ', err);
//                         });
//                 })
//                 .then(() => {
//                     logging.info(NAMESPACE, `Completed cronjob: publishDIDTx: ${network}`);
//                     // setTimeout(() => {
//                     //     publishDIDTx(network);
//                     // }, 5000);
//                 })
//                 .catch((err) => {
//                     logging.error(NAMESPACE, 'Error while trying to run the cronjob to publish DID txes: ', err);
//                 });
//         },
//         { timezone: 'Etc/UTC' }
//     );
// }

async function setLatestBlockInfo(network: string) {
    // * * * * * * format = second minute hour dayofmonth month dayofweek
    cron.schedule(
        '*/10 * * * * *',
        async () => {
            logging.info(NAMESPACE, `Started cronjob: setLatestBlockInfo: ${network}`);

            const rpcUrl = network === config.blockchain.testnet ? config.blockchain.eidSidechain.testnet.rpcUrl : config.blockchain.eidSidechain.mainnet.rpcUrl;
            const backupRpcUrl = network === config.blockchain.testnet ? config.blockchain.eidSidechain.testnet.backupRpcUrl : config.blockchain.eidSidechain.mainnet.backupRpcUrl;
            const chainId = network === config.blockchain.testnet ? config.blockchain.eidSidechain.testnet.chainId : config.blockchain.eidSidechain.mainnet.chainId;
            const genesisBlockHash = network === config.blockchain.testnet ? config.blockchain.eidSidechain.testnet.genesisBlockHash : config.blockchain.eidSidechain.mainnet.genesisBlockHash;
            const depositAddress = network === config.blockchain.testnet ? config.blockchain.eidSidechain.testnet.depositAddress : config.blockchain.eidSidechain.mainnet.depositAddress;
            const withdrawContractAddress =
                network === config.blockchain.testnet ? config.blockchain.eidSidechain.testnet.withdrawContractAddress : config.blockchain.eidSidechain.mainnet.withdrawContractAddress;
            const didContractAddress = network === config.blockchain.testnet ? config.blockchain.eidSidechain.testnet.didContractAddress : config.blockchain.eidSidechain.mainnet.didContractAddress;

            const web3 = new Web3(rpcUrl);

            const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;

            rpcService
                .getBlockHeight(network)
                .then((heightResponse) => {
                    const currentHeight: number = heightResponse.data.height - 1;
                    return currentHeight;
                })
                .then((height) => {
                    const checkHeightDone = conn.models.LatestBlockchainState.findOne({ chain: config.blockchain.eidSidechain.name })
                        .exec()
                        .then((state) => {
                            const latestState =
                                state ||
                                new conn.models.LatestBlockchainState({
                                    _id: new mongoose.Types.ObjectId(),
                                    chain: config.blockchain.eidSidechain.name,
                                    network
                                });
                            web3.eth
                                .getBlock(height)
                                .then((block: any) => {
                                    return block;
                                })
                                .then((block: any) => {
                                    latestState.height = height;
                                    latestState.block = block;
                                    latestState.miner = 'TBD';
                                    latestState.validator = {
                                        name: 'TBD',
                                        rank: Infinity,
                                        ownerKey: 'TBD',
                                        nodeKey: 'TBD',
                                        location: 'TBD',
                                        url: 'TBD',
                                        ip: 'TBD'
                                    };
                                    latestState.avgTxHourly = Infinity;
                                    latestState.accountsOverOneELA = Infinity;
                                    latestState.numTx = block.transactions.length;
                                    latestState.extraInfo = {
                                        rpcUrl,
                                        backupRpcUrl,
                                        chainId,
                                        genesisBlockHash,
                                        depositAddress,
                                        withdrawContractAddress,
                                        didContractAddress
                                    };
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
                .then(() => {
                    logging.info(NAMESPACE, `Completed cronjob: setLatestBlockInfo: ${network}`);
                })
                .catch((err: any) => {
                    logging.error(NAMESPACE, 'Error while trying to run the cronjob to get latest block details: ', err.toString());
                });
        },
        { timezone: 'Etc/UTC' }
    );
}

async function publishDIDTxPending(network: string) {
    logging.info(NAMESPACE, `Started cronjob: publishDIDTxPending: ${network}`);

    const rpcUrl = network === config.blockchain.testnet ? config.blockchain.eidSidechain.testnet.rpcUrl : config.blockchain.eidSidechain.mainnet.rpcUrl;

    const web3 = new Web3(rpcUrl);

    const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;

    await conn.models.DidTx.find({ status: config.txStatus.pending })
        .exec()
        .then((didTxes) => {
            const wallet = config.blockchain.eidSidechain.wallets.keystores[Math.floor(Math.random() * config.blockchain.eidSidechain.wallets.keystores.length)];
            didTxes.map((didTx, index) => {
                if (didTx.walletUsed) {
                    logging.info(NAMESPACE, `${didTx.did} is already being published...`);
                    return;
                }

                logging.info(NAMESPACE, `Using wallet ${wallet.address} to publish ${didTx.did}`);
                rpcService
                    .signTx(network, wallet, JSON.stringify(didTx.didRequest), index)
                    .then((res) => {
                        didTx.walletUsed = res.txDetails.walletUsed;
                        didTx.save();
                        if (res.error) {
                            logging.error(NAMESPACE, 'Error while publishing the a pending DID transaction to the blockchain: ', res.error);

                            didTx.status = config.txStatus.cancelled;
                            didTx.extraInfo = {
                                error: res.error
                            };
                            didTx.save();
                        } else {
                            setTimeout(() => {
                                web3.eth.sendSignedTransaction(res.txDetails.rawTx).on('transactionHash', (transactionHash: string) => {
                                    logging.info(NAMESPACE, `Pending tx ${res.txDetails.rawTx} has now been sent`);
                                    didTx.status = config.txStatus.processing;
                                    didTx.blockchainTxHash = transactionHash;
                                    didTx.save();
                                });
                            }, 5000);
                        }
                    })
                    .catch((error: any) => {
                        logging.error(NAMESPACE, 'Error while publishing the a pending DID transaction to the blockchain: ', error);

                        didTx.status = config.txStatus.cancelled;
                        didTx.extraInfo = {
                            error: error.toString()
                        };
                        didTx.save();
                    });
            });
        })
        .then(() => {
            logging.info(NAMESPACE, `Completed cronjob: publishDIDTxPending: ${network}`);

            setTimeout(() => {
                publishDIDTxPending(network);
            }, 5000);
        })
        .catch((err) => {
            logging.error(NAMESPACE, 'Error while publishing the Pending DID transactions to the blockchain: ', err);

            setTimeout(() => {
                publishDIDTxPending(network);
            }, 5000);
        });
}

async function publishDIDTxProcessing(network: string) {
    logging.info(NAMESPACE, `Started cronjob: publishDIDTxProcessing: ${network}`);

    const rpcUrl = network === config.blockchain.testnet ? config.blockchain.eidSidechain.testnet.rpcUrl : config.blockchain.eidSidechain.mainnet.rpcUrl;

    const web3 = new Web3(rpcUrl);

    const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;

    await conn.models.DidTx.find({ status: config.txStatus.processing })
        .exec()
        .then((didTxes) => {
            didTxes.map((didTx) => {
                web3.eth.getTransactionReceipt(didTx.blockchainTxHash, (err, txReceipt) => {
                    logging.info(NAMESPACE, `${didTx.did}: ${txReceipt}`);
                    if (!txReceipt) {
                        didTx.extraInfo = {
                            error: err
                        };
                        didTx.save();
                        return;
                    }
                    didTx.blockchainTxReceipt = txReceipt;
                    if (txReceipt.status) {
                        didTx.status = config.txStatus.completed;
                    } else {
                        didTx.status = config.txStatus.cancelled;
                        didTx.extraInfo = {
                            error: err
                        };
                        logging.error(NAMESPACE, 'Error while trying to publish DID transaction so changed its status to cancelled');
                    }
                    didTx.save();
                });
            });
        })
        .then(() => {
            logging.info(NAMESPACE, `Finished cronjob: publishDIDTxProcessing: ${network}`);

            setTimeout(() => {
                publishDIDTxProcessing(network);
            }, 5000);
        })
        .catch((err) => {
            logging.error(NAMESPACE, 'Error while trying to process Processing DID transactions from the database: ', err);

            setTimeout(() => {
                publishDIDTxProcessing(network);
            }, 5000);
        });
}

async function dailyCronjob(network: string) {
    // * * * * * * format = second minute hour dayofmonth month dayofweek
    cron.schedule(
        '0 0 0 * * *',
        async () => {
            logging.info(NAMESPACE, `Started cronjob: dailyCronjob: ${network}`);

            let beginDate = new Date();
            beginDate = new Date(`${beginDate.getUTCFullYear()}-${('0' + (beginDate.getUTCMonth() + 1)).slice(-2)}-${('0' + beginDate.getUTCDate()).slice(-2)}`);
            beginDate.setDate(beginDate.getDate() - 1);
            const endDate = new Date(`${beginDate.getUTCFullYear()}-${('0' + (beginDate.getUTCMonth() + 1)).slice(-2)}-${('0' + beginDate.getUTCDate()).slice(-2)}`);

            const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;

            // ---------------------------------------------------------------------------------------

            // Get wallet stats
            const getWalletStats = async () => {
                let walletStats: string = '<table><tr><th>Address</th><th>Balance</th></tr>';

                for (const keystore of config.blockchain.eidSidechain.wallets.keystores) {
                    const address = `0x${keystore.address}`;
                    const balance = await rpcService.getBalance(network, address).then((balanceResponse) => {
                        if (balanceResponse.meta.message === 'OK') {
                            return balanceResponse.data.value;
                        } else {
                            logging.error(NAMESPACE, `Error while getting balance of '${address}': `, balanceResponse.error);
                            return 'ERR';
                        }
                    });
                    walletStats += `<tr><td>${address}</td><td>${balance}</td></tr>`;
                }
                walletStats += '</table>';
                return walletStats;
            };

            // ---------------------------------------------------------------------------------------

            // Get all the transaction stats
            const getGeneralTxStats = async () => {
                const generalTxesStatsToday = await eidSidechainStats.getTxStats(network, beginDate, endDate);
                const generalTxesStatsAllTime = await eidSidechainStats.getTxStats(network, null, endDate);

                let generalTxStatsHtml: string = `<table><tr><th></th><th>Today</th><th>All time</th></tr>`;
                generalTxStatsHtml += `<tr><th>Number of Transactions</th><th>${generalTxesStatsToday.data.didTxes.numTxes}</th><th>${generalTxesStatsAllTime.data.didTxes.numTxes}</th></tr></table><br>`;

                // Today
                if (generalTxesStatsToday.data.didTxes.numTxes > 0) {
                    generalTxStatsHtml += `<table><tr><th>Request From(Username)</th><th>Request From(DID)</th><th>Numer of transactions Today</th></tr>`;
                }
                for (const username in generalTxesStatsToday.data.didTxes.txes) {
                    if (generalTxesStatsToday.data.didTxes.txes.hasOwnProperty(username)) {
                        for (const d in generalTxesStatsToday.data.didTxes.txes[username]) {
                            if (generalTxesStatsToday.data.didTxes.txes[username].hasOwnProperty(d)) {
                                let did = '';
                                let numTxes = generalTxesStatsToday.data.didTxes.txes[username][d];
                                if (d !== 'numTxes') {
                                    did = d;
                                    numTxes = generalTxesStatsToday.data.didTxes.txes[username][did];
                                }
                                generalTxStatsHtml += `<tr><td>${username}</td><td>${did}</td><td>${numTxes}</td></tr>`;
                            }
                        }
                    }
                }
                generalTxStatsHtml += `</table><br>`;

                // All time
                if (generalTxesStatsAllTime.data.didTxes.numTxes > 0) {
                    generalTxStatsHtml += `<table><tr><th>Request From(Username)</th><th>Request From(DID)</th><th>Number of transactions All time</th></tr>`;
                }
                for (const username in generalTxesStatsAllTime.data.didTxes.txes) {
                    if (generalTxesStatsAllTime.data.didTxes.txes.hasOwnProperty(username)) {
                        for (const d in generalTxesStatsAllTime.data.didTxes.txes[username]) {
                            if (generalTxesStatsAllTime.data.didTxes.txes[username].hasOwnProperty(d)) {
                                let did = '';
                                let numTxes = generalTxesStatsAllTime.data.didTxes.txes[username][d];
                                if (d !== 'numTxes') {
                                    did = d;
                                    numTxes = generalTxesStatsAllTime.data.didTxes.txes[username][did];
                                }
                                generalTxStatsHtml += `<tr><td>${username}</td><td>${did}</td><td>${numTxes}</td></tr>`;
                            }
                        }
                    }
                }
                generalTxStatsHtml += `</table>`;

                return generalTxStatsHtml;
            };

            // ---------------------------------------------------------------------------------------

            // Get general user stats
            const getGeneralUserStats = async () => {
                // Also make sure to reset the user accounts for today
                const generalUserStatsToday = await userStats.getStats(network, beginDate, endDate, false);
                const generalUserStatsAll = await userStats.getStats(network, null, endDate, true);

                let generalUserStatsHtml: string = `<table><tr><th></th><th>Today</th><th>All time</th></tr>`;
                generalUserStatsHtml += `<tr><th>Number of Users</th><th>${generalUserStatsToday.data.numUsers}</th><th>${generalUserStatsAll.data.numUsers}</th></tr></table><br>`;
                generalUserStatsHtml += `<tr><th>Number of API calls</th><th>${generalUserStatsToday.data.requests.today}</th><th>${generalUserStatsAll.data.requests.all}</th></tr></table><br>`;
                generalUserStatsHtml += `<tr><th>Weight of API calls</th><th>${generalUserStatsToday.data.requests.exhaustedQuota}</th><th>${generalUserStatsAll.data.requests.exhaustedQuota}</th></tr></table><br>`;

                if (generalUserStatsToday.data.numUsers > 0) {
                    generalUserStatsHtml += `<table><tr><th>New User Today</th><th>DID</th><th>Number of API calls</th><th>Weight of API calls</th></tr>`;
                }
                for (const username in generalUserStatsToday.data.users) {
                    if (generalUserStatsToday.data.users.hasOwnProperty(username)) {
                        generalUserStatsHtml += `<tr><td>${username}</td><td>${generalUserStatsToday.data.users[username].did}</td><td>${generalUserStatsToday.data.users[username].today}</td><td>${generalUserStatsToday.data.users[username].all}</td></tr>`;
                    }
                }
                generalUserStatsHtml += `</table>`;

                return generalUserStatsHtml;
            };

            // ---------------------------------------------------------------------------------------

            // Get all the outlier transactions
            const getOutlierTxesToday = async () => {
                const outlierDidTxesToday: any = {
                    numTxes: 0,
                    txes: []
                };

                await conn.models.DidTx.find({ createdAt: { $gte: beginDate, $lt: endDate } })
                    .exec()
                    .then((didTxes) => {
                        didTxes.map((didTx) => {
                            if (didTx.status === config.txStatus.cancelled) {
                                outlierDidTxesToday.numTxes += 1;
                                outlierDidTxesToday.txes.push(didTx);
                            }
                        });
                    })
                    .catch((err) => {
                        logging.error(NAMESPACE, 'Error while trying to retrieve outlier transactions from yesterday: ', err);
                    });
                let outlierTxesTodayHtml: string = `<table><tr><th>Number of outlier transactions</th><th>${outlierDidTxesToday.numTxes}</th></tr></table><br>`;

                // Individual transaction details
                if (outlierDidTxesToday.numTxes > 0) {
                    outlierTxesTodayHtml += `<table><tr><th>Timestamp</th><th>Confirmation Id</th><th>Request From(username)</th><th>Request From(DID)</th><th>DID Published</th><th>Status</th><th>Extra Info</th></tr>`;

                    outlierDidTxesToday.txes.map((didTx: any) => {
                        outlierTxesTodayHtml += `<tr><td>${didTx.createdAt}</td><td>${didTx._id}</td><td>${didTx.requestFrom.username}</td><td>${didTx.requestFrom.did}</td><td>${didTx.did}</td><td>${
                            didTx.status
                        }</td><td>${JSON.stringify(didTx.extraInfo)}</td></tr>`;
                    });
                    outlierTxesTodayHtml += `</table>`;
                }

                return outlierTxesTodayHtml;
            };

            // ---------------------------------------------------------------------------------------

            const htmlContent: string = `
        <!DOCTYPE html>
        <html>
            <head>
                <style>
                    table {
                        font-family: arial, sans-serif;
                        border-collapse: collapse;
                        width: 100%;
                    }

                    td, th {
                        border: 1px solid #dddddd;
                        text-align: left;
                        padding: 8px;
                    }

                    tr:nth-child(even) {
                        background-color: #dddddd;
                    }
                </style>
            </head>
            <body>
                <h2>Wallets and Current Balances</h2>
                ${await getWalletStats()}
                <h2>Transactions</h2>
                ${await getGeneralTxStats()}
                <h2>General User Stats</h2>
                ${await getGeneralUserStats()}
                <h2>Outlier Transactions Today</h2>
                ${await getOutlierTxesToday()}
            </body>
        </html>
        `;

            const subject: string = `Assist Service Daily Stats - ${network}`;
            sendNotification.sendEmail(subject, config.smtpCreds.sender, htmlContent);

            logging.info(NAMESPACE, `Completed cronjob: dailyCronjob: ${network}`);
        },
        { timezone: 'Etc/UTC' }
    );
}

export default { setLatestBlockInfo, publishDIDTxPending, publishDIDTxProcessing, dailyCronjob };
