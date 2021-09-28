import mongoose from 'mongoose';
import IUser from '../interfaces/user';
import logging from '../config/logging';
import config from '../config/config';

const NAMESPACE = 'Function: Account';

async function handleAPIQuota(conn: mongoose.Connection, authTokenDecoded: any, isPremiumEndpoint: boolean = false, weight: number = 0) {
    const username = authTokenDecoded.username;

    const user = {} as IUser;
    const result = {
        user,
        retCode: 200,
        error: ''
    };

    await conn.models.User.findOne({ username })
        .exec()
        .then((u) => {
            result.user = u;
            const count: number = isPremiumEndpoint ? result.user.requests.premiumEndpoints.today : result.user.requests.freeEndpoints.today;
            const dailyEndpointQuota = isPremiumEndpoint ? result.user.requests.premiumEndpoints.dailyQuota : result.user.requests.freeEndpoints.dailyQuota;
            if (count >= dailyEndpointQuota) {
                if (result.user.accountType === config.user.premiumAccountType.name) {
                    const balance = result.user.balance;
                    const requiredELA = weight;
                    if (balance < requiredELA) {
                        const error =
                            'The user "' +
                            result.user.username +
                            '" has exhausted their daily quota for premium API endpoints and does not have enough balance on their account to execute this API call. ' +
                            'Balance on account: ' +
                            balance +
                            ' ELA. Required ELA: ' +
                            requiredELA +
                            ' ELA';
                        logging.error(NAMESPACE, 'Error while trying to authenticate: ', error);

                        result.error = error;
                        result.retCode = 401;

                        return result;
                    }
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
