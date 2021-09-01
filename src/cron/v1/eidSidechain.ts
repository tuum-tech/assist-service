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

function publishDIDTx(network: string) {
    logging.info(NAMESPACE, `Started cronjob: publishDIDTx: ${network}`);

    const rpcUrl = network === config.blockchain.testnet ? config.blockchain.eidSidechain.testnet.rpcUrl : config.blockchain.eidSidechain.mainnet.rpcUrl;
    const contractAddress = network === config.blockchain.testnet ? config.blockchain.eidSidechain.testnet.contractAddress : config.blockchain.eidSidechain.mainnet.contractAddress;
    const chainId = network === config.blockchain.testnet ? config.blockchain.eidSidechain.testnet.chainId : config.blockchain.eidSidechain.mainnet.chainId;
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
            const pendingTxDone = conn.models.DidTx.find({ status: config.txStatus.pending })
                .exec()
                .then((didTxes) => {
                    didTxes.map((didTx, index) => {
                        const wallet = config.blockchain.eidSidechain.wallets.keystores[Math.floor(Math.random() * config.blockchain.eidSidechain.wallets.keystores.length)];
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
                                    web3.eth.sendSignedTransaction(res.txDetails.rawTx).on('transactionHash', (transactionHash: string) => {
                                        didTx.status = config.txStatus.processing;
                                        didTx.blockchainTxHash = transactionHash;
                                        didTx.walletUsed = res.txDetails.walletUsed;
                                        didTx.save();
                                    });
                                }
                            })
                            .catch((error) => {
                                logging.error(NAMESPACE, 'Error while publishing the a pending DID transaction to the blockchain: ', error);

                                didTx.status = config.txStatus.cancelled;
                                didTx.extraInfo = {
                                    error
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
            const processingTxDone = conn.models.DidTx.find({ status: config.txStatus.processing })
                .exec()
                .then((didTxes) => {
                    didTxes.map((didTx) => {
                        web3.eth.getTransactionReceipt(didTx.blockchainTxHash).then((receipt: any) => {
                            if (!receipt) {
                                return;
                            }
                            didTx.blockchainTxReceipt = receipt;
                            if (receipt.status) {
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

async function dailyCronjob(network: string) {
    // * * * * * * format = second minute hour dayofmonth month dayofweek
    cron.schedule(
        '0 0 0 * * *',
        async () => {
            logging.info(NAMESPACE, `Started cronjob: dailyCronjob: ${network}`);

            const beginDate = new Date();
            const endDate = new Date(`${beginDate.getUTCFullYear()}-${('0' + (beginDate.getUTCMonth() + 1)).slice(-2)}-${('0' + beginDate.getUTCDate()).slice(-2)}`);
            beginDate.setDate(beginDate.getDate() - 1);

            const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;

            // ---------------------------------------------------------------------------------------

            // Get general user stats
            const getGeneralUserStats = async () => {
                // Also make sure to reset the user accounts for today
                const generalUserStatsToday = await userStats.getStats(network, beginDate, endDate, false);
                const generalUserStatsAll = await userStats.getStats(network, null, endDate, true);

                let generalUserStatsHtml: string = `<table><tr><th></th><th>Today</th><th>All time</th></tr>`;
                generalUserStatsHtml += `<tr><th>Number of Users</th><th>${generalUserStatsToday.data.numUsers}</th><th>${generalUserStatsAll.data.numUsers}</th></tr></table><br>`;

                generalUserStatsHtml += `<table><tr><th>Endpoint Type</th><th>Today</th><th>All time</th></tr>`;
                generalUserStatsHtml += `<tr><td>Free</td><td>${generalUserStatsToday.data.freeAPI}</td><td>${generalUserStatsAll.data.freeAPI}</td></tr>`;
                generalUserStatsHtml += `<tr><td>Premium</td><td>${generalUserStatsToday.data.premiumAPI}</td><td>${generalUserStatsAll.data.premiumAPI}</td></tr></table><br>`;

                generalUserStatsHtml += `<table><tr><th>New User Today</th><th>Free Endpoints</th><th>Premium Endpoints</th></tr>`;
                for (const username in generalUserStatsToday.data.users) {
                    if (generalUserStatsToday.data.users.hasOwnProperty(username)) {
                        generalUserStatsHtml += `<tr><td>${username}</td><td>${generalUserStatsToday.data.users[username].freeAPI}</td><td>${generalUserStatsToday.data.users[username].premiumAPI}</td></tr>`;
                    }
                }
                generalUserStatsHtml += `</table>`;

                return generalUserStatsHtml;
            };

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
                generalTxStatsHtml += `<table><tr><th>Request From</th><th>Numer of transactions Today</th></tr>`;
                for (const username in generalTxesStatsToday.data.didTxes.txes) {
                    if (generalTxesStatsToday.data.didTxes.txes.hasOwnProperty(username)) {
                        generalTxStatsHtml += `<tr><td>${username}</td><td>${generalTxesStatsToday.data.didTxes.txes[username]}</td></tr>`;
                    }
                }
                generalTxStatsHtml += `</table><br>`;

                // All time
                generalTxStatsHtml += `<table><tr><th>Request From</th><th>Numer of transactions All time</th></tr>`;
                for (const username in generalTxesStatsAllTime.data.didTxes.txes) {
                    if (generalTxesStatsAllTime.data.didTxes.txes.hasOwnProperty(username)) {
                        generalTxStatsHtml += `<tr><td>${username}</td><td>${generalTxesStatsAllTime.data.didTxes.txes[username]}</td></tr>`;
                    }
                }
                generalTxStatsHtml += `</table>`;

                return generalTxStatsHtml;
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
                outlierTxesTodayHtml += `<table><tr><th>Timestamp</th><th>Confirmation Id</th><th>Request From</th><th>DID</th><th>Status</th><th>Extra Info</th></tr>`;
                outlierDidTxesToday.txes.map((didTx: any) => {
                    outlierTxesTodayHtml += `<tr><td>${didTx.createdAt}</td><td>${didTx._id}</td><td>${didTx.requestFrom.username}</td><td>${didTx.did}</td><td>${
                        didTx.status
                    }</td><td>${JSON.stringify(didTx.extraInfo)}</td></tr>`;
                });
                outlierTxesTodayHtml += `</table>`;

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
                <h2>General User Stats</h2>
                ${await getGeneralUserStats()}
                <h2>Transactions</h2>
                ${await getGeneralTxStats()}
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

export default { publishDIDTx, dailyCronjob };
