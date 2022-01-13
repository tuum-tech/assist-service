import mongoose from 'mongoose';
import cron from 'node-cron';
import config from '../../config/config';
import logging from '../../config/logging';
import rpcServiceEid from '../../services/v1/eidSidechainRpc';
import rpcServiceEvm from '../../services/v1/evmRpc';
import connMainnet from '../../connections/mainnet';
import connTestnet from '../../connections/testnet';
import sendNotification from '../../functions/sendNotification';
import userStats from '../../functions/stats/user';
import eidSidechainStats from '../../functions/stats/eidSidechain';
import Web3 from 'web3';

const NAMESPACE = 'Cron: EID Sidechain';

async function setLatestBlockInfo(network: string) {
    logging.info(NAMESPACE, '', `Started cronjob: setLatestBlockInfo: ${network}`);

    try {
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
        const isTestnet = network === config.blockchain.testnet ? true : false;

        const height = await rpcServiceEvm.getBlockHeight(config.blockchain.chainEid, isTestnet).then((heightResponse) => {
            const currentHeight: number = heightResponse.data.height - 1;
            return currentHeight;
        });

        const state = await conn.LatestBlockchainState.findOne({ chain: config.blockchain.eidSidechain.name }).exec();
        const latestState =
            state ||
            new conn.LatestBlockchainState({
                _id: new mongoose.Types.ObjectId(),
                chain: config.blockchain.eidSidechain.name,
                network
            });
        const block = await web3.eth.getBlock(height);
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
        await latestState.save();
    } catch (err: any) {
        logging.info(NAMESPACE, '', `Error while running cronjob: setLatestBlockInfo: ${network}: ${err.toString()}`);
    }
    logging.info(NAMESPACE, '', `Completed cronjob: setLatestBlockInfo: ${network}`);

    setTimeout(() => {
        setLatestBlockInfo(network);
    }, 10000);
}

async function publishDIDTxPending(network: string) {
    logging.info(NAMESPACE, '', `Started cronjob: publishDIDTxPending: ${network}`);

    try {
        const rpcUrl = network === config.blockchain.testnet ? config.blockchain.eidSidechain.testnet.rpcUrl : config.blockchain.eidSidechain.mainnet.rpcUrl;

        const web3 = new Web3(rpcUrl);

        const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;

        const didTxes = await conn.DidTx.find({ status: config.txStatus.pending }).exec();
        const wallet = config.blockchain.eidSidechain.wallets.keystores[Math.floor(Math.random() * config.blockchain.eidSidechain.wallets.keystores.length)];
        didTxes.map(async (didTx: any, index: any) => {
            if (didTx.walletUsed) {
                logging.info(NAMESPACE, '', `${didTx.did} is already being published`);
                return;
            }
            logging.info(NAMESPACE, '', `Using wallet ${wallet.address} to publish ${didTx.did}`);

            didTx.walletUsed = wallet.address;
            await didTx.save();

            const res = await rpcServiceEid.signTx(network, wallet, JSON.stringify(didTx.didRequest), index);
            if (res.error) {
                logging.error(NAMESPACE, '', 'Error while publishing the a pending DID transaction to the blockchain: ', res.error);

                didTx.status = config.txStatus.cancelled;
                didTx.extraInfo = {
                    error: res.error
                };
                await didTx.save();
            } else {
                await web3.eth.sendSignedTransaction(res.txDetails.rawTx).on('transactionHash', async (transactionHash: string) => {
                    logging.info(NAMESPACE, '', `Pending tx ${res.txDetails.rawTx} has now been sent`);

                    didTx.status = config.txStatus.processing;
                    didTx.blockchainTxHash = transactionHash;
                    await didTx.save();
                });
            }
        });
    } catch (err: any) {
        logging.info(NAMESPACE, '', `Error while running cronjob: publishDIDTxPending: ${network}: ${err.toString()}`);
    }
    logging.info(NAMESPACE, '', `Completed cronjob: publishDIDTxPending: ${network}`);

    setTimeout(() => {
        publishDIDTxPending(network);
    }, 5000);
}

async function publishDIDTxProcessing(network: string) {
    logging.info(NAMESPACE, '', `Started cronjob: publishDIDTxProcessing: ${network}`);

    try {
        const rpcUrl = network === config.blockchain.testnet ? config.blockchain.eidSidechain.testnet.rpcUrl : config.blockchain.eidSidechain.mainnet.rpcUrl;

        const web3 = new Web3(rpcUrl);

        const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;

        const didTxes = await conn.DidTx.find({ status: config.txStatus.processing }).exec();
        didTxes.map(async (didTx: any) => {
            await web3.eth.getTransactionReceipt(didTx.blockchainTxHash, async (err, txReceipt) => {
                logging.info(NAMESPACE, didTx.did, `${didTx.did}: ${txReceipt}`);
                if (!txReceipt) {
                    didTx.extraInfo = {
                        error: err
                    };
                } else {
                    didTx.blockchainTxReceipt = txReceipt;
                    if (txReceipt.status) {
                        didTx.status = config.txStatus.completed;
                    } else {
                        didTx.status = config.txStatus.cancelled;
                        didTx.extraInfo = {
                            error: err
                        };
                        logging.error(NAMESPACE, didTx.did, 'Error while trying to publish DID transaction so changed its status to cancelled');
                    }
                }
                await didTx.save();
            });
        });
    } catch (err: any) {
        logging.info(NAMESPACE, '', `Error while running cronjob: publishDIDTxProcessing: ${network}: ${err.toString()}`);
    }
    logging.info(NAMESPACE, '', `Completed cronjob: publishDIDTxProcessing: ${network}`);

    setTimeout(() => {
        publishDIDTxProcessing(network);
    }, 5000);
}

async function dailyCronjob(network: string) {
    // * * * * * * format = second minute hour dayofmonth month dayofweek
    cron.schedule(
        '0 0 0 * * *',
        async () => {
            logging.info(NAMESPACE, '', `Started cronjob: dailyCronjob: ${network}`);

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
                    const isTestnet = network === config.blockchain.testnet ? true : false;

                    const balance = await rpcServiceEvm.getBalance(config.blockchain.chainEid, address, isTestnet).then((balanceResponse) => {
                        if (balanceResponse.meta.message === 'OK') {
                            return balanceResponse.data.value;
                        } else {
                            logging.error(NAMESPACE, '', `Error while getting balance of '${address}': `, balanceResponse.error);
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

                await conn.DidTx.find({ createdAt: { $gte: beginDate, $lt: endDate } })
                    .exec()
                    .then((didTxes: any) => {
                        didTxes.map((didTx: any) => {
                            if (didTx.status === config.txStatus.cancelled) {
                                outlierDidTxesToday.numTxes += 1;
                                outlierDidTxesToday.txes.push(didTx);
                            }
                        });
                    })
                    .catch((err: any) => {
                        logging.error(NAMESPACE, '', 'Error while trying to retrieve outlier transactions from yesterday: ', err);
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

            logging.info(NAMESPACE, '', `Completed cronjob: dailyCronjob: ${network}`);
        },
        { timezone: 'Etc/UTC' }
    );
}

export default { setLatestBlockInfo, publishDIDTxPending, publishDIDTxProcessing, dailyCronjob };
