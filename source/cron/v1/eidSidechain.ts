import mongoose from 'mongoose';
import config from '../../config/config';
import logging from '../../config/logging';
import didTx from '../../models/didTx';
import DidTx from '../../models/didTx';
import rpcService from '../../services/v1/eidSidechainRpc';

const NAMESPACE = 'Cron: EID Sidechain';

async function publishDIDTx() {
    logging.info(NAMESPACE, 'Started cronjob: publishDIDTx');

    const heightResponse: any = await rpcService.getBlockHeight();
    console.log(`heightResponse: ${JSON.stringify(heightResponse)}`);

    DidTx.find({ status: 'Pending' })
        .exec()
        .then((didTxes) => {
            if (didTxes.length === 0) {
                logging.info(NAMESPACE, 'No Pending DID transactions were found in the database');
                return;
            }
            let didTx = didTxes[0];
            rpcService.sendTx(config.blockchain.eidSidechain.wallets.wallet1, JSON.stringify(didTx.didRequest)).then((txDetails) => {
                console.log('txDetails publishDIDTx:', txDetails);
                didTx.status = 'Processing';
                didTx.blockchainTxHash = txDetails['txHash'];
                didTx.blockchainTxReceipt = txDetails['txReceipt'];
                didTx.save();
            });
        })
        .catch((err) => {
            logging.error(NAMESPACE, 'Error while trying to retrieve DID transactions from the database: ', err);
        });

    logging.info(NAMESPACE, 'Completed cronjob: publishDIDTx');

    setTimeout(publishDIDTx, 5000);
}

export default { publishDIDTx };
