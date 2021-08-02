import mongoose from 'mongoose';
import logging from '../../config/logging';
import DidTx from '../../models/didTx';
import rpcService  from  '../../services/v1/eidSidechainRpc'

const NAMESPACE = 'Cron: EID Sidechain';

async function publishDIDTx() {
    logging.info(NAMESPACE, 'cronjob: publishDIDTx');

    const response: any = await rpcService.getBlockHeight();
    console.log(`response: ${JSON.stringify(response)}`);

    setTimeout(publishDIDTx, 5000);
};

export default { publishDIDTx };