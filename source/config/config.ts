import dotenv from 'dotenv';

dotenv.config();

const SERVER_TOKEN_EXPIRETIME = process.env.SERVER_TOKEN_EXPIRETIME || 3600;
const SERVER_TOKEN_ISSUER = process.env.SERVER_TOKEN_ISSUER || 'did:elastos:iag8qwq1xPBpLsGv4zR4CmzLpLUkBNfPHX';
const SERVER_TOKEN_SECRET = process.env.SERVER_TOKEN_SECRET || 'assist-service-key';

const SERVER = {
    hostname: '0.0.0.0',
    port: process.env.SERVER_PORT || 2000,
    production: process.env.PRODUCTION || false,
    token: {
        expireTime: SERVER_TOKEN_EXPIRETIME,
        issuer: SERVER_TOKEN_ISSUER,
        secret: SERVER_TOKEN_SECRET
    }
};

const MONGO_OPTIONS = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    socketTimeoutMS: 30000,
    keepAlive: true,
    poolSize: 25,
    autoIndex: false,
    retryWrites: SERVER.production === true ? true : false,
    authSource: 'admin',
    writeConcern: 'majority'
};

const MONGO_USERNAME = process.env.MONGO_USERNAME || 'mongoadmin';
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || 'mongopass';
const MONGO_HOST_MAINNET = `${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/assistdb` || 'localhost:37018/assistdb';
const MONGO_HOST_TESTNET = `${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/assistdb-testnet` || 'localhost:37018/assistdb-testnet';

const MONGO = {
    options: MONGO_OPTIONS,
    mainnet: {
        url: SERVER.production === true ? `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST_MAINNET}` : `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST_MAINNET}`
    },
    testnet: {
        url: SERVER.production === true ? `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST_TESTNET}` : `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST_TESTNET}`
    }
};

const USER = {
    defaultUsername: 'defaultUser',
    freeAcountType: 'free',
    premiumAccountType: 'premium',
    freeEndpointsDailyLimit: 10000,
    premiumEndpointsDailyLimit: 10
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
        contractAddress: '0x46E5936a9bAA167b3368F4197eDce746A66f7a7a',
        chainId: 22
    },
    testnet: {
        rpcUrl: 'https://api-testnet.elastos.io/eid',
        contractAddress: '0xF654c3cBBB60D7F4ac7cDA325d51E62f47ACD436',
        chainId: 23
    },
    wallets: EID_SIDECHAIN_WALLETS
};
const BLOCKCHAIN = {
    mainnet: 'mainnet',
    testnet: 'testnet',
    tuumnet: 'tuumnet',
    eidSidechain: EID_SIDECHAIN
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
    smtpTls: Boolean(process.env.EMAIL_SMTP_TLS) || false
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
