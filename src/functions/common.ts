import config from '../config/config';
import logging from '../config/logging';
import dayjs from 'dayjs';
import formatParser from 'dayjs/plugin/customParseFormat';

const NAMESPACE = 'Function: Common';

dayjs.extend(formatParser);

function getDateFromString(dateString: string) {
    let date = new Date();
    if (dateString === 'today') {
        return date;
    } else if (dateString === 'yesterday') {
        date.setDate(date.getDate() - 1);
    } else {
        if (dayjs(dateString, 'YYYY-MM-DD', true).isValid()) {
            date = new Date(dateString);
        } else {
            return null;
        }
    }
    return date;
}

export default { getDateFromString };
