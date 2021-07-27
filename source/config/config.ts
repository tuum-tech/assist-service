import dotenv from 'dotenv';

dotenv.config();

const SERVER = {
    hostname: '0.0.0.0',
    port: process.env.SERVER_PORT || 2000,
    production: process.env.PRODUCTION || false
};

const DEFAULT_WALLET =
    '{"address":"365b70f14e10b02bef7e463eca6aa3e75ca3cdb1","crypto":{"cipher":"aes-128-ctr","ciphertext":"9e67a5e03097410530156386e1268b3d0a0514e68097360e2e6923e2062c5658","cipherparams":{"iv":"bc3a82c8d7eb92e3eb340fd994b77fdc"},"kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"p":1,"r":8,"salt":"0acca53ddca20aa77ff2cbdede6b92f45e2d552898d8199d324f381fddf78b71"},"mac":"66368304132d966967e85ac60ca7c5bc2f2fb46f70c76942459b9f3e11b4e077"},"id":"3c248f12-f4de-4c51-b967-ae700837f76a","version":3}';
const EID_SIDECHAIN_WALLETS = {
    walletPass: process.env.EID_WALLET_PASS || '',
    wallet1: process.env.EID_WALLET1 || DEFAULT_WALLET,
    wallet2: process.env.EID_WALLET2 || DEFAULT_WALLET,
    wallet3: process.env.EID_WALLET3 || DEFAULT_WALLET,
    wallet4: process.env.EID_WALLET || DEFAULT_WALLET
};
const EID_SIDECHAIN = {
    rpcUrl: process.env.EID_SIDECHAIN_RPC_URL_ETH || 'https://api.elastos.io/eid',
    contractAddress: process.env.EID_CONTRACT_ADDRESS || '0x46E5936a9bAA167b3368F4197eDce746A66f7a7a',
    chainId: process.env.EID_CHAIN_ID || 22,
    wallets: EID_SIDECHAIN_WALLETS
};
const BLOCKCHAIN = {
    network: process.env.NETWORK || 'mainnet',
    eidSidechain: EID_SIDECHAIN
};

const DEFAULT_MNEMONICS = 'curious push water point border mutual install govern message ordinary fish small';
const DEFAULT_DID = 'did:elastos:iag8qwq1xPBpLsGv4zR4CmzLpLUkBNfPHX';
const HIVEVAULT = {
    hiveHost: process.env.HIVE_HOST || 'http://localhost:9001',
    serviceAppID: process.env.ASSIST_SERVICE_APP_ID || DEFAULT_DID,
    serviceAppMnemonics: process.env.ASSIST_SERVICE_APP_MNEMONICS || DEFAULT_MNEMONICS,
    serviceUserMnemonics: process.env.ASSIST_SERVICE_USER_MNEMONICS || DEFAULT_MNEMONICS
};

const CRON = {
    interval: process.env.CRON_INTERVAL || 8
};

const SMTP_CREDS = {
    sender: process.env.EMAIL_SENDER || 'test@test.com',
    smtpServer: process.env.EMAIL_SMTP_SERVER || 'smtp.example.com',
    smtpUser: process.env.EMAIL_SMTP_USERNAME || 'support@example.com',
    smtpPass: process.env.EMAIL_SMTP_PASSWORD || 'password',
    smtpPort: process.env.EMAIL_SMTP_PORT || 587,
    smtpTls: process.env.EMAIL_SMTP_TLS || false
};

const config = {
    server: SERVER,
    blockchain: BLOCKCHAIN,
    hiveVault: HIVEVAULT,
    cron: CRON,
    smtpCreds: SMTP_CREDS
};

export default config;
