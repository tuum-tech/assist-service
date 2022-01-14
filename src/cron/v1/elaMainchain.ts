import mongoose from 'mongoose';
import config from '../../config/config';
import logging from '../../config/logging';
import rpcService from '../../services/v1/elaMainchainRpc';
import externalService from '../../services/v1/external';
import connMainnet from '../../connections/mainnet';
import connTestnet from '../../connections/testnet';

const NAMESPACE = 'Cron: ELA Mainchain';

async function setLatestBlockInfo(network: string) {
    logging.info(NAMESPACE, '', `Started cronjob: setLatestBlockInfo: ${network}`);

    try {
        const rpcUrl = network === config.blockchain.testnet ? config.blockchain.elaMainchain.testnet.rpcUrl : config.blockchain.elaMainchain.mainnet.rpcUrl;
        const backupRpcUrl = network === config.blockchain.testnet ? config.blockchain.elaMainchain.testnet.backupRpcUrl : config.blockchain.elaMainchain.mainnet.backupRpcUrl;

        const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;

        const [heightResponse, state] = await Promise.all([rpcService.getBlockHeight(network), conn.LatestBlockchainState.findOne({ chain: config.blockchain.elaMainchain.name }).exec()]);
        const height = heightResponse.data.height - 1;

        const latestState =
            state ||
            (await new conn.LatestBlockchainState({
                _id: new mongoose.Types.ObjectId(),
                chain: config.blockchain.elaMainchain.name,
                network
            }).save());

        const rCoinGecko: any = await externalService.getELAPriceCoinGecko();
        let elaPriceUsd = 0.1;
        if (rCoinGecko.data) {
            elaPriceUsd = rCoinGecko.data.elaPriceUsd;
        } else {
            const cmcPrice: any = await externalService.getELAPriceCoinmarketcap();
            if (cmcPrice.data) {
                elaPriceUsd = cmcPrice.data.elaPriceUsd;
            } else {
                elaPriceUsd = latestState.elaPriceUsd || 0.1;
            }
        }

        const blockInfoResponse = await rpcService.getBlockInfoByHeight(network, height);
        const block = blockInfoResponse.data.block;

        // TODO: console.log(block);
        latestState.height = height;
        latestState.block = block;
        latestState.currentMiner = block.minerinfo;
        const validators = await rpcService.getDPoSValidators(network, height);
        latestState.dposArbiters = validators.data.dposArbiters;
        latestState.dposCandidates = validators.data.dposCandidates;
        latestState.currentValidator = validators.data.currentValidator;
        latestState.nextValidator = validators.data.nextValidator;
        latestState.elaPriceUsd = elaPriceUsd;
        latestState.avgTxHourly = Infinity;
        latestState.accountsOverOneELA = Infinity;
        const miningInfo = await rpcService.getMiningInfo(network);
        latestState.hashrate = miningInfo.data.networkHashPs;
        latestState.numTx = block.tx.length;
        latestState.extraInfo = {
            rpcUrl,
            backupRpcUrl
        };
        await latestState.save();
    } catch (err: any) {
        logging.info(NAMESPACE, '', `Error while running cronjob: setLatestBlockInfo: ${network}: ${err.toString()}`);
    }
    logging.info(NAMESPACE, '', `Completed cronjob: setLatestBlockInfo: ${network}`);

    setTimeout(() => {
        setLatestBlockInfo(network);
    }, 60000);
}

export default { setLatestBlockInfo };
