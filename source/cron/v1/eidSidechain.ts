import mongoose from 'mongoose';
import logging from '../../config/logging';
import DidTx from '../../models/didTx';

const NAMESPACE = 'Cron: EID Sidechain';

const publishDIDTx = () => {
    logging.error(NAMESPACE, 'cronjob: publishDIDTx');
};

export default {
    publishDIDTx
};
