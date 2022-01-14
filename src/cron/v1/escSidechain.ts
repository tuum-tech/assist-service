import mongoose from 'mongoose';
import cron from 'node-cron';
import config from '../../config/config';
import logging from '../../config/logging';
import rpcServiceEvm from '../../services/v1/evmRpc';
import connMainnet from '../../connections/mainnet';
import connTestnet from '../../connections/testnet';
import Web3 from 'web3';

const NAMESPACE = 'Cron: ESC Sidechain';

async function setLatestBlockInfo(network: string) {
    logging.info(NAMESPACE, '', `Started cronjob: setLatestBlockInfo: ${network}`);

    try {
        const rpcUrl = network === config.blockchain.testnet ? config.blockchain.escSidechain.testnet.rpcUrl : config.blockchain.escSidechain.mainnet.rpcUrl;
        const backupRpcUrl = network === config.blockchain.testnet ? config.blockchain.escSidechain.testnet.backupRpcUrl : config.blockchain.escSidechain.mainnet.backupRpcUrl;
        const chainId = network === config.blockchain.testnet ? config.blockchain.escSidechain.testnet.chainId : config.blockchain.escSidechain.mainnet.chainId;
        const genesisBlockHash = network === config.blockchain.testnet ? config.blockchain.escSidechain.testnet.genesisBlockHash : config.blockchain.escSidechain.mainnet.genesisBlockHash;
        const depositAddress = network === config.blockchain.testnet ? config.blockchain.escSidechain.testnet.depositAddress : config.blockchain.escSidechain.mainnet.depositAddress;
        const withdrawContractAddress =
            network === config.blockchain.testnet ? config.blockchain.escSidechain.testnet.withdrawContractAddress : config.blockchain.escSidechain.mainnet.withdrawContractAddress;

        const web3 = new Web3(rpcUrl);

        const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;
        const isTestnet = network === config.blockchain.testnet ? true : false;

        const [heightResponse, state] = await Promise.all([
            rpcServiceEvm.getBlockHeight(config.blockchain.chainEsc, isTestnet),
            conn.LatestBlockchainState.findOne({ chain: config.blockchain.escSidechain.name }).exec()
        ]);
        const height = heightResponse.data.height - 1;

        const latestState =
            state ||
            (await new conn.LatestBlockchainState({
                _id: new mongoose.Types.ObjectId(),
                chain: config.blockchain.escSidechain.name,
                network
            }).save());
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
            withdrawContractAddress
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

export default { setLatestBlockInfo };
