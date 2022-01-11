import mongoose from 'mongoose';
import IUser from '../interfaces/user';
import logging from '../config/logging';
import config from '../config/config';
import externalService from '../services/v1/external';

const NAMESPACE = 'Function: Account';

async function handleAPIQuota(conn: any, authTokenDecoded: any, costInUsd: number) {
    const username = authTokenDecoded.username;

    const user = {} as IUser;
    const result = {
        user,
        quota: {
            elaPriceUsed: `$${0}`,
            endpointCost: `$${costInUsd}`,
            quotaFormula: `cost / currentElaPrice`,
            exhaustedQuota: 0,
            remainingQuota: 0,
            totalQuota: 0,
            balanceInAccount: '0 ELA; Upgrade to premium account to deposit ELA that will increase your total quota'
        },
        retCode: 200,
        error: ''
    };

    await conn.User.findOne({ username })
        .exec()
        .then(async (u: IUser) => {
            result.user = u;
            const exhaustedQuota: number = result.user.requests.exhaustedQuota;
            const totalQuota: number = result.user.requests.totalQuota;
            const quotaToExhaust = await conn.LatestBlockchainState.findOne({ chain: config.blockchain.elaMainchain.name })
                .exec()
                .then((state: any) => {
                    result.quota.elaPriceUsed = `$${state.elaPriceUsd}`;
                    return Number((costInUsd / state.elaPriceUsd).toFixed(5));
                });
            result.quota.exhaustedQuota = quotaToExhaust;

            result.quota.totalQuota = totalQuota;
            result.quota.remainingQuota = Number((totalQuota - (exhaustedQuota + quotaToExhaust)).toFixed(5));

            if (result.user.accountType === config.user.premiumAccountType) {
                result.quota.totalQuota = result.quota.totalQuota + result.user.balance;
                result.quota.remainingQuota = result.quota.remainingQuota + result.user.balance;
                result.quota.balanceInAccount = `${result.user.balance} ELA`;
            }

            if (exhaustedQuota >= totalQuota) {
                if (result.user.accountType === config.user.premiumAccountType) {
                    if (result.user.balance < quotaToExhaust) {
                        const error =
                            'You have exhausted your monthly quota and do not have enough balance on your account to execute this API call. ' +
                            'Cost of this API call: ' +
                            quotaToExhaust +
                            ' Your remaining Quota: ' +
                            (totalQuota - exhaustedQuota) +
                            'Balance on account: ' +
                            result.user.balance +
                            ' ELA. ';
                        logging.error(NAMESPACE, 'Error while trying to authenticate: ', error);

                        result.error = error;
                        result.retCode = 401;

                        return result;
                    }
                    result.user.balance -= quotaToExhaust;
                    result.quota.balanceInAccount = `${result.user.balance} ELA`;
                } else {
                    const error =
                        'You have exhausted your allocated quota of ' +
                        totalQuota +
                        '. Please upgrade your account to a premium account(which is free to do by the way) before proceeding. ' +
                        'Cost of this API call: ' +
                        quotaToExhaust +
                        ' Your remaining Quota: ' +
                        (totalQuota - exhaustedQuota);
                    logging.error(NAMESPACE, 'Error while trying to authenticate: ', error);

                    result.error = error;
                    result.retCode = 401;

                    return result;
                }
            }
            result.user.requests.exhaustedQuota += quotaToExhaust;
            result.user.requests.today += 1;
            result.user.requests.all += 1;
        })
        .catch((error: any) => {
            logging.error(NAMESPACE, 'Error while trying to validate the user: ', error);

            result.error = error;
            result.retCode = 500;

            return result;
        });
    return result;
}

export default { handleAPIQuota };
