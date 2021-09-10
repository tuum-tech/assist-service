### Retrieve the latest block info

Get the latest block info from the ESC sidechain

```bash
token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImtpcmFuIiwiaWF0IjoxNjMwMzUwODI2LCJleHAiOjMyNjEwNjE2NTIsImlzcyI6ImRpZDplbGFzdG9zOmlhZzhxd3ExeFBCcExzR3Y0elI0Q216THBMVWtCTmZQSFgifQ.meX4soGF0s_ugAo-c2tZeQOKTvILJj-ZhZBeXqG5_RQ";
curl http://localhost:2000/v1/escSidechain/get/blockInfo/latest?network=mainnet -H "Authorization: Bearer ${token}"
```

```yaml
Request type: GET
Url: /v1/elaMainchain/get/blockInfo/latest?network=[mainnet|testnet]
Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
Return:
    Success:
    {
        "meta": {
            "code": 200,
            "message": "OK",
            "network": "mainnet"
        },
        "data": {
            "_id": "613bc91bd613757f930658d3",
            "chain": "escSidechain",
            "network": "mainnet",
            "extraInfo": {
                "rpcUrl": "https://api.elastos.io/eth",
                "backupRpcUrl": "https://api.trinity-tech.cn/eth",
                "chainId": 20,
                "genesisBlockHash": "0x6afc2eb01956dfe192dc4cd065efdf6c3c80448776ca367a7246d279e228ff0a",
                "depositAddress": "XVbCTM7vqM1qHKsABSFH4xKN1qbp7ijpWf",
                "withdrawContractAddress": "0xC445f9487bF570fF508eA9Ac320b59730e81e503"
            },
            "height": 1332250,
            "miner": "F2Pool",
            "validator": "Noderators - Watermelon",
            "avgTxHourly": 84,
            "accountsOverOneELA": 26247,
            "numTx": 1,
            "block": {
                "difficulty": "2",
                "extraData": "0x2102661637ae97c3af0580e1954ee80a7323973b256ca862cfcf01b4a18432670db448f6e27b946d16e642c9eea676dd9c5e97b4dbf76f38f3014d5abe12777b3d0c00000000403f427ec1a11e637599fd6cdcadc5de4f5f35feb8cec275aee5f8dc9e96964b902bf1f5d23ada374229ccf09ccf3ec5c8b13f415ff20fbac01b8c220536842fb80900000000000000ecc97268f23de1c91f35191cdb4ec61fae4af35afa20e6e50b157bda960882432102d4a8f5016ae22b1acdf8a2d72f6eb712932213804efd2ce30ca8d0b9b4295ac5014039c72c22186f2991a2e878553d1d0d25c8b04bd212e01426cd87561827d9fdfda465ddd81003c74210b0278eb882d11a644000278ac3c47cc02492818d871a1aecc97268f23de1c91f35191cdb4ec61fae4af35afa20e6e50b157bda960882432102089d7e878171240ce0e3633d3ddc8b1128bc221f6b5f0d1551caa717c74930620140879d1b1c8e2309daab97b50c93ad8f14b2b40808195aaf474470108b9c03641d42950977d2e5cea5b0855a1a5fd7d43afa0791425f1999fc4b2f75b360f37e5cecc97268f23de1c91f35191cdb4ec61fae4af35afa20e6e50b157bda96088243210268214956b8421c0621d62cf2f0b20a02c2dc8c2cc89528aff9bd43b45ed34b9f0140d4a222cc55d6012dec1d73c52b8a62103e1033020d3f443c35a9e49ac0664320192f63016adc1ed57b42820577d2bf7583c8badc157374aa9de39967e389a03decc97268f23de1c91f35191cdb4ec61fae4af35afa20e6e50b157bda960882432102b95b000f087a97e988c24331bf6769b4a75e4b7d5d2a38105092a3aa841be33b01408912d87777e50c5ad99dacfee7e2d9768adea2b580ab5b5b9f4a38855dd6878f70dadd207ce1f014be3692d23ee4e22213a31d49fc2a31767c928955cefa9b8becc97268f23de1c91f35191cdb4ec61fae4af35afa20e6e50b157bda960882432102661637ae97c3af0580e1954ee80a7323973b256ca862cfcf01b4a18432670db401408e708e9bd87e127961421b1db25b6c1f24ce8e0915a1cc8c7866f78943d08fb25981e6abdb549cc3f37079763912fb2009fc30009a62144fe3ef39aea01da261ecc97268f23de1c91f35191cdb4ec61fae4af35afa20e6e50b157bda9608824321027d816821705e425415eb64a9704f25b4cd7eaca79616b0881fc92ac44ff8a46b01400b9a0a544f4458592699a09b2d1a65210d831b9952a0d6209630bc15ea6517256ac0daeee5d0e266737e0ab53f71d64efe365b0ddd7323a6b9e05638551e8e86ecc97268f23de1c91f35191cdb4ec61fae4af35afa20e6e50b157bda960882432103cce325c55057d2c8e3fb03fb5871794e73b85821e8d0f96a7e4510b4a922fad50140e67f46fa38ef68a054d0416fbd9dd18165ed87d81940e05582812dc466d7adc745b7245f9f5d2d7a9a223152506e0201a152321f7bc0730f73ba439de25d143cecc97268f23de1c91f35191cdb4ec61fae4af35afa20e6e50b157bda960882432103e3fe6124a4ea269224f5f43552250d627b4133cfd49d1f9e0283d0cd2fd209bc0140dde98f290adbec9cb9b8e5c6ba4dd4ae5ab7c65e81dfac2ccadf1c0cca37117f33c401088c6f500f98e48135d06a1c64d4141bd63d88c00c505451ece7627a9fecc97268f23de1c91f35191cdb4ec61fae4af35afa20e6e50b157bda9608824321029a4d8e4c99a1199f67a25d79724e14f8e6992a0c8b8acf102682bd8f500ce0c10140f82d4a2f3b44d9e556d5d5e978aa0f89fbe3d137889694fd640d737716155c7b9554e3a85f6b3428b995afcb8dc2812a50b207251410962f1c5b6b729f826c9e",
                "gasLimit": 100000000,
                "gasUsed": 0,
                "hash": "0x6672a731dfc61cd634d727ad4397a1762503df10b26f7481adb560056f67e597",
                "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                "miner": "0x32AC06FFC6D8c09C9a8172e76fc497C9Ae2B3798",
                "mixHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
                "nonce": "0x00000000000ec427",
                "number": 1332250,
                "parentHash": "0xd419e3a7a97b919ee938e522c1cc7fef3e247604a7fccc9e28a64c0c6fd7580f",
                "receiptsRoot": "0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421",
                "sha3Uncles": "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
                "size": 1845,
                "stateRoot": "0x692a9b631df94d41d74dcfa56e05f13e45106c5f2243ac485adc1560af919e8e",
                "timestamp": 1631305699,
                "totalDifficulty": "2664501",
                "transactions": [],
                "transactionsRoot": "0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421",
                "uncles": []
            },
            "createdAt": "2021-09-10T01:41:37.661Z",
            "updatedAt": "2021-09-10T20:28:29.417Z",
            "__v": 0
        }
    }
    Failure:
    {
        "meta": {
            "code": 401,
            "message": "ERR",
            "network": "mainnet"
        },
        "error": err_message
    }
```
