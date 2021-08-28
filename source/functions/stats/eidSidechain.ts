import config from '../../config/config';
import logging from '../../config/logging';
import connMainnet from '../../connections/mainnet';
import connTestnet from '../../connections/testnet';

const NAMESPACE = 'Function: EidSidechain';

async function getTxStats(network: string, beginDate: any, endDate: Date) {
    const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;
    let generalTxesStats: any = {
        data: {
            didTxes: {
                numTxes: 0,
                txes: {}
            }
            // Add in other types of transactions here in the future
        },
        error: null
    };

    // Aggregate did txes
    let result: any[] = [];
    if (beginDate == null) {
        result = await conn.models.DidTx.aggregate([
            { $match: { createdAt: { $lt: endDate } } },
            { $group: { _id: '$requestFrom.username', count: { $sum: 1 } } },
            { $project: { _id: 0, username: '$_id', count: '$count' } }
        ]);
    } else {
        result = await conn.models.DidTx.aggregate([
            { $match: { createdAt: { $gte: beginDate, $lt: endDate } } },
            { $group: { _id: '$requestFrom.username', count: { $sum: 1 } } },
            { $project: { _id: 0, username: '$_id', count: '$count' } }
        ]);
    }
    for (let r of result) {
        let numTxes = r.count;
        generalTxesStats.data.didTxes.numTxes += numTxes;
        generalTxesStats.data.didTxes.txes[r.username] = numTxes;
    }

    return generalTxesStats;
}

export default { getTxStats };
