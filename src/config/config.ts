import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const SERVER_TOKEN_EXPIRETIME = Number(process.env.SERVER_TOKEN_EXPIRETIME) || 3600;
const SERVER_TOKEN_ISSUER = process.env.SERVER_TOKEN_ISSUER || 'did:elastos:iag8qwq1xPBpLsGv4zR4CmzLpLUkBNfPHX';
const SERVER_TOKEN_SECRET = process.env.SERVER_TOKEN_SECRET || 'assist-service-key';

const SERVER = {
    hostname: '0.0.0.0',
    port: Number(process.env.SERVER_PORT) || 3000,
    production: JSON.parse((process.env.PRODUCTION || 'false').toLowerCase()),
    token: {
        expireTime: SERVER_TOKEN_EXPIRETIME,
        issuer: SERVER_TOKEN_ISSUER,
        secret: SERVER_TOKEN_SECRET
    },
    paymentElaAddress: process.env.PAYMENT_ELA_ADDRESS || 'EHohTEm9oVUY5EQxm8MDb6fBEoRpwTyjbb',
    cmcApiKey: process.env.CMC_API_KEY || 'bh39a234-1053-57h4-44gv-83a16b1e3f84'
};

const MONGO_OPTIONS: mongoose.ConnectOptions = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    socketTimeoutMS: 30000,
    keepAlive: true,
    poolSize: 25,
    autoIndex: false,
    authSource: 'admin',
    writeConcern: 'majority'
};

const MONGO_USERNAME = process.env.MONGO_USERNAME || 'mongoadmin';
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || 'mongopass';
const MONGO_HOST = process.env.MONGO_HOST || 'localhost';
const MONGO_PORT = Number(process.env.MONGO_PORT) || 37018;
const MONGO_DATABASE_MAINNET = 'assist-service-mainnet';
const MONGO_DATABASE_TESTNET = 'assist-service-testnet';
const MONGO = {
    options: MONGO_OPTIONS,
    mainnet: {
        url:
            SERVER.production === true
                ? `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST}/${MONGO_DATABASE_MAINNET}`
                : `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DATABASE_MAINNET}`
    },
    testnet: {
        url:
            SERVER.production === true
                ? `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST}/${MONGO_DATABASE_TESTNET}`
                : `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DATABASE_TESTNET}`
    }
};

const USER = {
    defaultUsername: 'defaultUser',
    freeAcountType: {
        name: 'free',
        freeEndpointsDailyLimit: 10000,
        premiumEndpointsDailyLimit: 10
    },
    premiumAccountType: {
        name: 'premium',
        balance: 0,
        freeEndpointsDailyLimit: 25000,
        premiumEndpointsDailyLimit: 25
    }
};

const DEFAULT_WALLET =
    '{"address":"365b70f14e10b02bef7e463eca6aa3e75ca3cdb1","crypto":{"cipher":"aes-128-ctr","ciphertext":"9e67a5e03097410530156386e1268b3d0a0514e68097360e2e6923e2062c5658","cipherparams":{"iv":"bc3a82c8d7eb92e3eb340fd994b77fdc"},"kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"p":1,"r":8,"salt":"0acca53ddca20aa77ff2cbdede6b92f45e2d552898d8199d324f381fddf78b71"},"mac":"66368304132d966967e85ac60ca7c5bc2f2fb46f70c76942459b9f3e11b4e077"},"id":"3c248f12-f4de-4c51-b967-ae700837f76a","version":3}';
const EID_SIDECHAIN_WALLETS = {
    pass: process.env.EID_WALLET_PASS || '',
    keystores: [
        JSON.parse(process.env.EID_WALLET1 || DEFAULT_WALLET),
        JSON.parse(process.env.EID_WALLET2 || DEFAULT_WALLET),
        JSON.parse(process.env.EID_WALLET3 || DEFAULT_WALLET),
        JSON.parse(process.env.EID_WALLET4 || DEFAULT_WALLET)
    ]
};
const EID_SIDECHAIN = {
    name: 'eidSidechain',
    mainnet: {
        rpcUrl: 'https://api.elastos.io/eid',
        backupRpcUrl: 'https://api.trinity-tech.cn/eid',
        chainId: 22,
        genesisBlockHash: '0x7d0702054ad68913eff9137dfa0b0b6ff701d55062359deacad14859561f5567',
        depositAddress: 'XUgTgCnUEqMUKLFAg3KhGv1nnt9nn8i3wi',
        withdrawContractAddress: '0x6F60FdED6303e73A83ef99c53963407f415e80b9',
        didContractAddress: '0x46E5936a9bAA167b3368F4197eDce746A66f7a7a'
    },
    testnet: {
        rpcUrl: 'https://api-testnet.elastos.io/eid',
        backupRpcUrl: 'https://api-testnet.trinity-tech.cn/eid',
        chainId: 23,
        genesisBlockHash: '0x3d0f9da9320556f6d58129419e041de28cf515eedc6b59f8dae49df98e3f943c',
        depositAddress: 'XPsgiVQC3WucBYDL2DmPixj74Aa9aG3et8',
        withdrawContractAddress: '0x762a042b8B9f9f0d3179e992d965c11785219599',
        didContractAddress: '0xF654c3cBBB60D7F4ac7cDA325d51E62f47ACD436'
    },
    wallets: EID_SIDECHAIN_WALLETS
};
const ESC_SIDECHAIN = {
    name: 'escSidechain',
    mainnet: {
        rpcUrl: 'https://api.elastos.io/eth',
        backupRpcUrl: 'https://api.trinity-tech.cn/eth',
        chainId: 20,
        genesisBlockHash: '0x6afc2eb01956dfe192dc4cd065efdf6c3c80448776ca367a7246d279e228ff0a',
        depositAddress: 'XVbCTM7vqM1qHKsABSFH4xKN1qbp7ijpWf',
        withdrawContractAddress: '0xC445f9487bF570fF508eA9Ac320b59730e81e503'
    },
    testnet: {
        rpcUrl: 'https://api-testnet.elastos.io/eth',
        backupRpcUrl: 'https://api-testnet.trinity-tech.cn/eth',
        chainId: 21,
        genesisBlockHash: '0x698e5ec133064dabb7c42eb4b2bdfa21e7b7c2326b0b719d5ab7f452ae8f5ee4',
        depositAddress: 'XWCiyXM1bQyGTawoaYKx9PjRkMUGGocWub',
        withdrawContractAddress: '0x491bC043672B9286fA02FA7e0d6A3E5A0384A31A'
    },
    wallets: EID_SIDECHAIN_WALLETS
};
const ELA_MAINCHAIN = {
    name: 'elaMainchain',
    mainnet: {
        rpcUrl: 'https://api.elastos.io/ela',
        backupRpcUrl: 'https://api.trinity-tech.cn/ela'
    },
    testnet: {
        rpcUrl: 'https://api-testnet.elastos.io/ela',
        backupRpcUrl: 'https://api-testnet.trinity-tech.cn/ela'
    }
};
const BLOCKCHAIN = {
    mainnet: 'mainnet',
    testnet: 'testnet',
    tuumnet: 'tuumnet',
    validNetworks: ['mainnet', 'testnet'],
    eidSidechain: EID_SIDECHAIN,
    escSidechain: ESC_SIDECHAIN,
    elaMainchain: ELA_MAINCHAIN
};

const TX_STATUS = {
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed',
    cancelled: 'Cancelled'
};

const SMTP_CREDS = {
    sender: process.env.EMAIL_SENDER || 'test@test.com',
    smtpServer: process.env.EMAIL_SMTP_SERVER || 'smtp.example.com',
    smtpUser: process.env.EMAIL_SMTP_USERNAME || 'support@example.com',
    smtpPass: process.env.EMAIL_SMTP_PASSWORD || 'password',
    smtpPort: Number(process.env.EMAIL_SMTP_PORT) || 587,
    smtpTls: JSON.parse((process.env.EMAIL_SMTP_TLS || 'false').toLowerCase())
};

const config = {
    server: SERVER,
    user: USER,
    mongo: MONGO,
    blockchain: BLOCKCHAIN,
    txStatus: TX_STATUS,
    smtpCreds: SMTP_CREDS
};

export default config;
