import mongoose from 'mongoose';
import IUser from '../interfaces/user';
import logging from '../config/logging';
import config from '../config/config';
import externalService from '../services/v1/external';

const NAMESPACE = 'Function: Account';

async function handleAPIQuota(conn: mongoose.Connection, authTokenDecoded: any, isPremiumEndpoint: boolean = false, cost: number) {
    const username = authTokenDecoded.username;

    const user = {} as IUser;
    const result = {
        user,
        quota: {
            elaPriceUsed: `$${0}`,
            cost: `$${cost}`,
            quotaFormula: `cost / currentElaPrice`,
            exhaustedQuota: 0,
            remainingQuota: 0,
            totalQuota: 0
        },
        retCode: 200,
        error: ''
    };

    await conn.models.User.findOne({ username })
        .exec()
        .then(async (u) => {
            result.user = u;
            const currentQuotaReached: number = isPremiumEndpoint ? result.user.requests.premiumEndpoints.today : result.user.requests.freeEndpoints.today;
            const dailyEndpointQuota = isPremiumEndpoint ? result.user.requests.premiumEndpoints.dailyQuota : result.user.requests.freeEndpoints.dailyQuota;
            const quotaToExhaust = await conn.models.LatestBlockchainState.findOne({ chain: config.blockchain.elaMainchain.name })
                .exec()
                .then((state) => {
                    result.quota.elaPriceUsed = `$${state.elaPriceUsd}`;
                    return Number((cost / state.elaPriceUsd).toFixed(5));
                });
            result.quota.exhaustedQuota = quotaToExhaust;

            result.user.requests.premiumEndpoints.today += quotaToExhaust;
            result.user.requests.premiumEndpoints.all += quotaToExhaust;
            result.user.requests.totalAPICalls += 1;
            result.user.save().catch((error: any) => {
                logging.error(NAMESPACE, 'Error while trying to save exhausted quota to the database: ', error);

                result.error = error;
                result.retCode = 500;

                return result;
            });

            result.quota.totalQuota = dailyEndpointQuota;
            result.quota.remainingQuota = dailyEndpointQuota - (currentQuotaReached + quotaToExhaust);

            if (result.user.accountType === config.user.premiumAccountType.name) {
                result.quota.totalQuota = result.quota.totalQuota + result.user.balance;
                result.quota.remainingQuota = result.quota.remainingQuota + result.user.balance;
            }

            if (currentQuotaReached >= dailyEndpointQuota) {
                if (result.user.accountType === config.user.premiumAccountType.name) {
                    const balance = result.user.balance;
                    if (balance < quotaToExhaust) {
                        const error =
                            'The user "' +
                            result.user.username +
                            '" has exhausted their daily quota for premium API endpoints and does not have enough balance on their account to execute this API call. ' +
                            'Balance on account: ' +
                            balance +
                            ' ELA. Required ELA: ' +
                            quotaToExhaust +
                            ' ELA';
                        logging.error(NAMESPACE, 'Error while trying to authenticate: ', error);

                        result.error = error;
                        result.retCode = 401;

                        return result;
                    }
                    result.user.balance -= quotaToExhaust;
                } else {
                    const error = 'The user "' + result.user.username + '" has reached the daily API call quota of ' + dailyEndpointQuota;
                    logging.error(NAMESPACE, 'Error while trying to authenticate: ', error);

                    result.error = error;
                    result.retCode = 401;

                    return result;
                }
            }
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
