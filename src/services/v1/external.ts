import config from '../../config/config';
import logging from '../../config/logging';
import commonService from './common';
import { CoinGeckoAPI } from '@coingecko/cg-api-ts';
import fetch from 'cross-fetch';

const NAMESPACE = 'Service: External';

const getExternalHeaders = (): any => {
    return {
        Accepts: 'application/json',
        'Content-Type': 'application/json',
        'X-CMC_PRO_API_KEY': config.server.cmcApiKey
    };
};

async function getELAPriceCoinGecko() {
    const res: any = {
        data: null,
        error: null
    };

    const cg = new CoinGeckoAPI(fetch);
    const { data, response } = await cg.getCoinsId('elastos');
    if (data) {
        const market_data = data.market_data;
        res.data = {
            elaPriceUsd: market_data.current_price.usd
        };
    } else {
        res.error = 'Could not fetch ELA price';
    }

    if (res.error) {
        return commonService.returnError(config.blockchain.mainnet, 500, res.error);
    }
    return commonService.returnSuccess(config.blockchain.mainnet, 200, res.data);
}

async function getELAPriceCoinmarketcap() {
    const rpcUrl = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=2492';
    const res: any = await commonService.handleRoute(rpcUrl, {}, getExternalHeaders(), false);
    if (res.error) {
        return commonService.returnError(config.blockchain.mainnet, 500, res.error);
    }
    const elaPriceUsd = res.data.data['2492'].quote.USD.price;
    res.data = {
        elaPriceUsd
    };
    return commonService.returnSuccess(config.blockchain.mainnet, 200, res.data);
}

export default { getELAPriceCoinGecko, getELAPriceCoinmarketcap };
