import mongoose from 'mongoose';
import IUser from '../interfaces/user';
import config from '../config/config';
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

    await conn.models.User.find({ username })
        .exec()
        .then((users) => {
            if (users.length !== 1) {
                result.error = 'Unathorized';
                result.retCode = 401;
                return result;
            }
            const user = users[0];
            result.user = user;
            const count: number = isPremiumEndpoint ? user.requests.premiumEndpoints.today : user.requests.freeEndpoints.today;
            const dailyEndpointLimit = isPremiumEndpoint ? user.requests.premiumEndpoints.dailyLimit : user.requests.freeEndpoints.dailyLimit;
            if (count >= dailyEndpointLimit) {
                const error = 'The user "' + user.username + '" has reached the daily API call limit of ' + dailyEndpointLimit;
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