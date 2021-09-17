import mongoose from 'mongoose';
import IUser from '../interfaces/user';
import logging from '../config/logging';

const NAMESPACE = 'Function: Account';

async function handleAPILimit(conn: mongoose.Connection, authTokenDecoded: any, isPremiumEndpoint: boolean = false) {
    const username = authTokenDecoded.username;

    const user = {} as IUser;
    const result = {
        user,
        retCode: 200,
        error: ''
    };

    await conn.models.User.findOne({ username })
        .exec()
        .then((user) => {
            result.user = user;
            const count: number = isPremiumEndpoint ? result.user.requests.premiumEndpoints.today : result.user.requests.freeEndpoints.today;
            const dailyEndpointLimit = isPremiumEndpoint ? result.user.requests.premiumEndpoints.dailyLimit : result.user.requests.freeEndpoints.dailyLimit;
            if (count >= dailyEndpointLimit) {
                const error = 'The user "' + result.user.username + '" has reached the daily API call limit of ' + dailyEndpointLimit;
                logging.error(NAMESPACE, 'Error while trying to authenticate: ', error);

                result.error = error;
                result.retCode = 401;

                return result;
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

export default { handleAPILimit };
