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

    cron.schedule('*/5 * * * * *', async () => {
        logging.info(NAMESPACE, `Started cronjob: dailyCronjob: ${network}`);

        const today = new Date('2021-08-05');

        // ---------------------------------------------------------------------------------------

        // Reset the user accounts for today and get some general stats
        const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;
        let generalUserStats: any = {
            free: {
                today: 0,
                all: 0
            },
            premium: {
                today: 0,
                all: 0
            },
            usersToday: {},
            numUsersToday: 0,
            numUsersAllTime: 0
        };
        conn.models.User.find()
            .select('-password')
            .exec()
            .then((users) => {
                users.map((user) => {
                    let freeEndpointsAll = user.requests.freeEndpoints.all;
                    let premiumEndpointsAll = user.requests.premiumEndpoints.all;
                    generalUserStats.free.today += user.requests.freeEndpoints.today;
                    generalUserStats.free.all += freeEndpointsAll;
                    generalUserStats.premium.today += user.requests.premiumEndpoints.today;
                    generalUserStats.premium.all += premiumEndpointsAll;
                    generalUserStats.numUsersAllTime += 1;
                    if (new Date(user.createdAt) >= today) {
                        generalUserStats.numUsersToday += 1;
                        generalUserStats.usersToday[user.username] = {
                            free: freeEndpointsAll,
                            premium: premiumEndpointsAll
                        };
                    }

                    // Reset
                    user.requests.freeEndpoints.today = 0;
                    user.requests.premiumEndpoints.today = 0;
                    user.save();
                });
            })
            .catch((err) => {
                logging.error(NAMESPACE, 'Error while trying to reset daily limit for the users: ', err);
            });
        // Get general user stats
        const getGeneralUserStats = async () => {
            let generalUserStatsHtml: string = `<table><tr><th></th><th>Today</th><th>All time</th></tr>`;
            generalUserStatsHtml += `<tr><th>Number of Users</th><th>${generalUserStats.numUsersToday}</th><th>${generalUserStats.numUsersAllTime}</th></tr></table><br>`;

            generalUserStatsHtml += `<table><tr><th>Request Type</th><th>Today</th><th>All time</th></tr>`;
            generalUserStatsHtml += `<tr><td>Free</td><td>${generalUserStats.free.today}</td><td>${generalUserStats.free.all}</td></tr>`;
            generalUserStatsHtml += `<tr><td>Premium</td><td>${generalUserStats.premium.today}</td><td>${generalUserStats.premium.all}</td></tr></table><br>`;

            generalUserStatsHtml += `<table><tr><th>New User</th><th>Free</th><th>Premium</th></tr>`;
            for (let username in generalUserStats.usersToday) {
                generalUserStatsHtml += `<tr><td>${username}</td><td>${generalUserStats.usersToday[username].free}</td><td>${generalUserStats.usersToday[username].premium}</td></tr>`;
            }
            generalUserStatsHtml += `</table>`;

            return generalUserStatsHtml;
        };

        // ---------------------------------------------------------------------------------------

        // Get wallet stats
        const getWalletStats = async () => {
            let walletStats: string = '<table><tr><th>Address</th><th>Balance</th><th>Type</th></tr>';

            let testAddress = '0x365b70f14e10b02bef7e463eca6aa3e75ca3cdb1';
            let testBalance = await rpcService.getBalance(network, testAddress).then((balanceResponse) => {
                if (balanceResponse.meta.message === 'OK') {
                    return balanceResponse.data.value;
                } else {
                    logging.error(NAMESPACE, `Error while getting balance of '${testAddress}': `, balanceResponse.error);
                    return 'ERR';
                }
            });
            walletStats += `<tr><td>${testAddress}</td><td>${testBalance}</td><td>Testing</td></tr>`;

            for (let keystore of config.blockchain.eidSidechain.wallets.keystores) {
                let address = `0x${keystore.address}`;
                let balance = await rpcService.getBalance(network, address).then((balanceResponse) => {
                    if (balanceResponse.meta.message === 'OK') {
                        return balanceResponse.data.value;
                    } else {
                        logging.error(NAMESPACE, `Error while getting balance of '${address}': `, balanceResponse.error);
                        return 'ERR';
                    }
                });
                walletStats += `<tr><td>${address}</td><td>${balance}</td><td>Production</td></tr>`;
            }
            walletStats += '</table>';
            return walletStats;
        };
        // ---------------------------------------------------------------------------------------

        let htmlContent: string = `
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
                <h2>DID Transactions</h2>
                {didtx_stats}
                <h2>Cancelled Transactions</h2>
                {quarantined_transactions}
            </body>
        </html>
        `;

        const subject: string = `Assist Service Daily Stats - ${network}`;
        sendNotification.sendEmail(subject, config.smtpCreds.sender, htmlContent);

        logging.info(NAMESPACE, `Completed cronjob: dailyCronjob: ${network}`);
    });
}

export default { publishDIDTx, dailyCronjob };
