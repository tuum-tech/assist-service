### Publish DID transaction

Publish a DID transaction to the Elastos ID sidechain by passing in a valid did request payload

```bash
token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImtpcmFuIiwiaWF0IjoxNjMwMzUwODI2LCJleHAiOjMyNjEwNjE2NTIsImlzcyI6ImRpZDplbGFzdG9zOmlhZzhxd3ExeFBCcExzR3Y0elI0Q216THBMVWtCTmZQSFgifQ.meX4soGF0s_ugAo-c2tZeQOKTvILJj-ZhZBeXqG5_RQ";
curl -XPOST http://localhost:2000/v1/eidSidechain/publish/didTx -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d @- << EOF
{
    "network": "mainnet",
    "didRequest": {
        "header": {
            "specification": "elastos/did/1.0",
            "operation": "create"
        },
        "payload": "eyJpZCI6ImRpZDplbGFzdG9zOmlrOENoSExRb3pycXQxaEJ6WHEyV1NqTUZzWjlKVW94YXQiLCJwdWJsaWNLZXkiOlt7ImlkIjoiZGlkOmVsYXN0b3M6aWs4Q2hITFFvenJxdDFoQnpYcTJXU2pNRnNaOUpVb3hhdCNwcmltYXJ5IiwidHlwZSI6IkVDRFNBc2VjcDI1NnIxIiwiY29udHJvbGxlciI6ImRpZDplbGFzdG9zOmlrOENoSExRb3pycXQxaEJ6WHEyV1NqTUZzWjlKVW94YXQiLCJwdWJsaWNLZXlCYXNlNTgiOiIyNGFzUDVYQ1ptQXRGRFRkOThLajFwbVhMcHZkMTgyYUxvYng5VEd4M1hIekoifV0sImF1dGhlbnRpY2F0aW9uIjpbImRpZDplbGFzdG9zOmlrOENoSExRb3pycXQxaEJ6WHEyV1NqTUZzWjlKVW94YXQjcHJpbWFyeSJdLCJleHBpcmVzIjoiMjAyNi0wNi0xOFQxODowMzowNloiLCJwcm9vZiI6eyJ0eXBlIjoiRUNEU0FzZWNwMjU2cjEiLCJjcmVhdGVkIjoiMjAyMS0wNi0xOFQxODowMzowN1oiLCJjcmVhdG9yIjoiZGlkOmVsYXN0b3M6aWs4Q2hITFFvenJxdDFoQnpYcTJXU2pNRnNaOUpVb3hhdCNwcmltYXJ5Iiwic2lnbmF0dXJlVmFsdWUiOiIteUtmRHZyaHdWdzVfYllGTXUwUkowT1JHaXNVU3F5ek5BeTdzRGZ1dFFSNzduS0FOV012aGNRMnYxbG5DWTA0U2ZjdlozTDUyTFQ5WE8wQnZNZEVrQSJ9fQ",
        "proof": {
            "type": "ECDSAsecp256r1",
            "verificationMethod": "did:elastos:ik8ChHLQozrqt1hBzXq2WSjMFsZ9JUoxat#primary",
            "signature": "EJkEUzeQkJkRTkKoZXyQEuEgXcmWDJh-l7iWdZwcc0lcLdipf8ihTeDFalP-I_2TsptzAGX75hD-ny2Cz78W5g"
        }
    },
    "memo": "Published from GetDIDs.com"
}
EOF
```

```yaml
Request type: POST
Url: /v1/eidSidechain/publish/didTx
Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
Content-Type: 'application/json'
Data: { 'network': 'mainnet|testnet', 'didRequest': {}, 'memo': 'Published from GetDIDs.com' }
Return:
    Success:
    {
        "meta": {
            "code": 200,
            "message": "OK",
            "network": "mainnet"
        },
        "data": {
            "didTx": {
                "_id": "613a6be82767c2abecd1a4d6",
                "did: "iXsAh966DMs4Rwd8UCChemdxfHsXTodg7j",
                "requestFrom": {
                    "username": "kiran"
                },
                "didRequest": {
                    "header": {
                        "operation": "create"
                        "specification": "elastos/did/1.0"
                    },
                    "payload": "eyJpZCI6ImRpZDplbGFzdG9zOmlYc0FoOTY2RE1zNFJ3ZDhVQ0NoZW1keGZIc1hUb2RnN2oiLCJwdWJsaWNLZXkiOlt7ImlkIjoiZGlkOmVsYXN0b3M6aVhzQWg5NjZETXM0UndkOFVDQ2hlbWR4ZkhzWFRvZGc3aiNwcmltYXJ5IiwidHlwZSI6IkVDRFNBc2VjcDI1NnIxIiwiY29udHJvbGxlciI6ImRpZDplbGFzdG9zOmlYc0FoOTY2RE1zNFJ3ZDhVQ0NoZW1keGZIc1hUb2RnN2oiLCJwdWJsaWNLZXlCYXNlNTgiOiJ6V2FWUW1UVm4xQ01kZ2h5YkdQNGt3aXlNWThybXl5UFFHN0gyNFdTbndmNiJ9XSwiYXV0aGVudGljYXRpb24iOlsiZGlkOmVsYXN0b3M6aVhzQWg5NjZETXM0UndkOFVDQ2hlbWR4ZkhzWFRvZGc3aiNwcmltYXJ5Il0sImV4cGlyZXMiOiIyMDI2LTA5LTA5VDIwOjE3OjQxWiIsInByb29mIjp7InR5cGUiOiJFQ0RTQXNlY3AyNTZyMSIsImNyZWF0ZWQiOiIyMDIxLTA5LTA5VDIwOjE3OjQxWiIsImNyZWF0b3IiOiJkaWQ6ZWxhc3RvczppWHNBaDk2NkRNczRSd2Q4VUNDaGVtZHhmSHNYVG9kZzdqI3ByaW1hcnkiLCJzaWduYXR1cmVWYWx1ZSI6InpPV1RGTXVHM1VtNGZ5d2NFY3RSX3QycGItMk0yaVFaaEN6S2QyaW1fRnFKX1FUYlBqYUVMbWpmZnkxRlZKQjBaZXhHRWVybUl2VHNOVVRYaUNpUG1RIn19",
                    "proof": {
                        "signature": "Al3yV-hF9AVr0skpKgPo0nxFdfCiC6FQOey58KgryCUXbWjAv1CrKZvTM9tNoD0-U3PKRCnLBARPKAyB0gF2Ng"
                        "type": "ECDSAsecp256r1"
                        "verificationMethod": "did:elastos:iXsAh966DMs4Rwd8UCChemdxfHsXTodg7j#primary"
                    }
                },
                "memo": "Published from GetDIDs.com",
                "status": "Pending",
                "createdAt": "2021-09-09T20:17:44.860Z",
                "updatedAt": "2021-09-09T20:17:44.860Z",
                "__v": 0,
                "confirmationId": "613a6be82767c2abecd1a4d6"
            }
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

### Get all DID transactions

Get all the DID transactions

```bash
token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImtpcmFuIiwiaWF0IjoxNjMwMzUwODI2LCJleHAiOjMyNjEwNjE2NTIsImlzcyI6ImRpZDplbGFzdG9zOmlhZzhxd3ExeFBCcExzR3Y0elI0Q216THBMVWtCTmZQSFgifQ.meX4soGF0s_ugAo-c2tZeQOKTvILJj-ZhZBeXqG5_RQ";
curl http://localhost:2000/v1/eidSidechain/get/didTxes?network=mainnet -H "Authorization: Bearer ${token}"
```

```yaml
Request type: GET
Url: /v1/eidSidechain/get/didTxes?network=[mainnet|testnet]
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
            "didTxes": [
                {
                    "requestFrom": {
                        "username": "kiran"
                    },
                    "_id": "612eb91f05a127bc7525a583",
                    "did": "imwh9khL6uVJtrLcwYGJrAX4CHSSZKuJ9p",
                    "didRequest": {
                        "header": {
                            "specification": "elastos/did/1.0",
                            "operation": "create"
                        },
                        "payload": "eyJpZCI6ImRpZDplbGFzdG9zOmltd2g5a2hMNnVWSnRyTGN3WUdKckFYNENIU1NaS3VKOXAiLCJwdWJsaWNLZXkiOlt7ImlkIjoiZGlkOmVsYXN0b3M6aW13aDlraEw2dVZKdHJMY3dZR0pyQVg0Q0hTU1pLdUo5cCNwcmltYXJ5IiwidHlwZSI6IkVDRFNBc2VjcDI1NnIxIiwiY29udHJvbGxlciI6ImRpZDplbGFzdG9zOmltd2g5a2hMNnVWSnRyTGN3WUdKckFYNENIU1NaS3VKOXAiLCJwdWJsaWNLZXlCYXNlNTgiOiJqVWhNOTFFbkF0UWI2TTc2R2ozTndWTGVmZUNRMzNBTFVZOGl3QVNyanlQcSJ9XSwiYXV0aGVudGljYXRpb24iOlsiZGlkOmVsYXN0b3M6aW13aDlraEw2dVZKdHJMY3dZR0pyQVg0Q0hTU1pLdUo5cCNwcmltYXJ5Il0sImV4cGlyZXMiOiIyMDI2LTA4LTMxVDIzOjE5OjU2WiIsInByb29mIjp7InR5cGUiOiJFQ0RTQXNlY3AyNTZyMSIsImNyZWF0ZWQiOiIyMDIxLTA4LTMxVDIzOjE5OjU2WiIsImNyZWF0b3IiOiJkaWQ6ZWxhc3RvczppbXdoOWtoTDZ1Vkp0ckxjd1lHSnJBWDRDSFNTWkt1SjlwI3ByaW1hcnkiLCJzaWduYXR1cmVWYWx1ZSI6ImFIU3FlcDdxNFBHLTQ2R3RHZVlTaDNoaUY4UXhaSUlKbERNcFEzRlNTLWRsY2FuU3hXUFFZMFhTN25STk9iVjNYMzI0TG1sQ0pLaGRuREVGU3FKeWh3In19",
                        "proof": {
                            "type": "ECDSAsecp256r1",
                            "verificationMethod": "did:elastos:imwh9khL6uVJtrLcwYGJrAX4CHSSZKuJ9p#primary",
                            "signature": "G5fxZKMfMlCbGhewQaebpeeFAaKYThG7mNZE5iTLrL0x3bFRg78-vkRb7zvAxDS6SGSJvgDYMZd6qY59M1JdGw"
                        }
                    },
                    "memo": "Published from GetDIDs.com",
                    "status": "Completed",
                    "createdAt": "2021-08-31T23:19:59.485Z",
                    "updatedAt": "2021-08-31T23:20:20.963Z",
                    "__v": 0,
                    "blockchainTxHash": "0xfb861ddaf27b371a66d0ac456bebe88b23ac95fbfa1f3bfe7e4a8b4b71caa78d",
                    "blockchainTxReceipt": {
                        "blockHash": "0xfb226a099e511b1d75ffd33f80441baa2fcfcb6115aecd47e0687683c4ea2853",
                        "blockNumber": 1174647,
                        "contractAddress": null,
                        "cumulativeGasUsed": 113464,
                        "didLog": {
                            "did": "did:elastos:imwh9khL6uVJtrLcwYGJrAX4CHSSZKuJ9p",
                            "operation": "create",
                            "data": "D2VsYXN0b3MvZGlkLzEuMAZjcmVhdGX9TANleUpwWkNJNkltUnBaRHBsYkdGemRHOXpPbWx0ZDJnNWEyaE1OblZXU25SeVRHTjNXVWRLY2tGWU5FTklVMU5hUzNWS09YQWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pWkdsa09tVnNZWE4wYjNNNmFXMTNhRGxyYUV3MmRWWktkSEpNWTNkWlIwcHlRVmcwUTBoVFUxcExkVW81Y0NOd2NtbHRZWEo1SWl3aWRIbHdaU0k2SWtWRFJGTkJjMlZqY0RJMU5uSXhJaXdpWTI5dWRISnZiR3hsY2lJNkltUnBaRHBsYkdGemRHOXpPbWx0ZDJnNWEyaE1OblZXU25SeVRHTjNXVWRLY2tGWU5FTklVMU5hUzNWS09YQWlMQ0p3ZFdKc2FXTkxaWGxDWVhObE5UZ2lPaUpxVldoTk9URkZia0YwVVdJMlRUYzJSMm96VG5kV1RHVm1aVU5STXpOQlRGVlpPR2wzUVZOeWFubFFjU0o5WFN3aVlYVjBhR1Z1ZEdsallYUnBiMjRpT2xzaVpHbGtPbVZzWVhOMGIzTTZhVzEzYURscmFFdzJkVlpLZEhKTVkzZFpSMHB5UVZnMFEwaFRVMXBMZFVvNWNDTndjbWx0WVhKNUlsMHNJbVY0Y0dseVpYTWlPaUl5TURJMkxUQTRMVE14VkRJek9qRTVPalUyV2lJc0luQnliMjltSWpwN0luUjVjR1VpT2lKRlEwUlRRWE5sWTNBeU5UWnlNU0lzSW1OeVpXRjBaV1FpT2lJeU1ESXhMVEE0TFRNeFZESXpPakU1T2pVMldpSXNJbU55WldGMGIzSWlPaUprYVdRNlpXeGhjM1J2Y3pwcGJYZG9PV3RvVERaMVZrcDBja3hqZDFsSFNuSkJXRFJEU0ZOVFdrdDFTamx3STNCeWFXMWhjbmtpTENKemFXZHVZWFIxY21WV1lXeDFaU0k2SW1GSVUzRmxjRGR4TkZCSExUUTJSM1JIWlZsVGFETm9hVVk0VVhoYVNVbEtiRVJOY0ZFelJsTlRMV1JzWTJGdVUzaFhVRkZaTUZoVE4yNVNUazlpVmpOWU16STBURzFzUTBwTGFHUnVSRVZHVTNGS2VXaDNJbjE5DkVDRFNBc2VjcDI1NnIxNmRpZDplbGFzdG9zOmltd2g5a2hMNnVWSnRyTGN3WUdKckFYNENIU1NaS3VKOXAjcHJpbWFyeVZHNWZ4WktNZk1sQ2JHaGV3UWFlYnBlZUZBYUtZVGhHN21OWkU1aVRMckwweDNiRlJnNzgtdmtSYjd6dkF4RFM2U0dTSnZnRFlNWmQ2cVk1OU0xSmRHdw==",
                            "transactionHash": "0xfb861ddaf27b371a66d0ac456bebe88b23ac95fbfa1f3bfe7e4a8b4b71caa78d",
                            "removed": false
                        },
                        "from": "0x14b1cf2ceecfd04006a57dd060692758aa1ca330",
                        "gasUsed": 113464,
                        "logs": [],
                        "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000020000004000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000",
                        "status": true,
                        "to": "0x46e5936a9baa167b3368f4197edce746a66f7a7a",
                        "transactionHash": "0xfb861ddaf27b371a66d0ac456bebe88b23ac95fbfa1f3bfe7e4a8b4b71caa78d",
                        "transactionIndex": 0
                    }
                }
            ],
            "count": 1
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

### Get DID tx by confirmation id

Get a specific DID transaction according to its confirmation ID

```bash
token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImtpcmFuIiwiaWF0IjoxNjMwMzUwODI2LCJleHAiOjMyNjEwNjE2NTIsImlzcyI6ImRpZDplbGFzdG9zOmlhZzhxd3ExeFBCcExzR3Y0elI0Q216THBMVWtCTmZQSFgifQ.meX4soGF0s_ugAo-c2tZeQOKTvILJj-ZhZBeXqG5_RQ";
curl http://localhost:2000/v1/eidSidechain/get/didTx/confirmationId/612eb91f05a127bc7525a583?network=mainnet -H "Authorization: Bearer ${token}"
```

```yaml
Request type: GET
Url: /v1/eidSidechain/get/didTx/confirmationId/612eb91f05a127bc7525a583?network=[mainnet|testnet]
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
            "didTx": {
                "requestFrom": {
                    "username": "GetDIDs.com"
                },
                "_id": "612eb91f05a127bc7525a583",
                "did": "imwh9khL6uVJtrLcwYGJrAX4CHSSZKuJ9p",
                "didRequest": {
                    "header": {
                        "specification": "elastos/did/1.0",
                        "operation": "create"
                    },
                    "payload": "eyJpZCI6ImRpZDplbGFzdG9zOmltd2g5a2hMNnVWSnRyTGN3WUdKckFYNENIU1NaS3VKOXAiLCJwdWJsaWNLZXkiOlt7ImlkIjoiZGlkOmVsYXN0b3M6aW13aDlraEw2dVZKdHJMY3dZR0pyQVg0Q0hTU1pLdUo5cCNwcmltYXJ5IiwidHlwZSI6IkVDRFNBc2VjcDI1NnIxIiwiY29udHJvbGxlciI6ImRpZDplbGFzdG9zOmltd2g5a2hMNnVWSnRyTGN3WUdKckFYNENIU1NaS3VKOXAiLCJwdWJsaWNLZXlCYXNlNTgiOiJqVWhNOTFFbkF0UWI2TTc2R2ozTndWTGVmZUNRMzNBTFVZOGl3QVNyanlQcSJ9XSwiYXV0aGVudGljYXRpb24iOlsiZGlkOmVsYXN0b3M6aW13aDlraEw2dVZKdHJMY3dZR0pyQVg0Q0hTU1pLdUo5cCNwcmltYXJ5Il0sImV4cGlyZXMiOiIyMDI2LTA4LTMxVDIzOjE5OjU2WiIsInByb29mIjp7InR5cGUiOiJFQ0RTQXNlY3AyNTZyMSIsImNyZWF0ZWQiOiIyMDIxLTA4LTMxVDIzOjE5OjU2WiIsImNyZWF0b3IiOiJkaWQ6ZWxhc3RvczppbXdoOWtoTDZ1Vkp0ckxjd1lHSnJBWDRDSFNTWkt1SjlwI3ByaW1hcnkiLCJzaWduYXR1cmVWYWx1ZSI6ImFIU3FlcDdxNFBHLTQ2R3RHZVlTaDNoaUY4UXhaSUlKbERNcFEzRlNTLWRsY2FuU3hXUFFZMFhTN25STk9iVjNYMzI0TG1sQ0pLaGRuREVGU3FKeWh3In19",
                    "proof": {
                        "type": "ECDSAsecp256r1",
                        "verificationMethod": "did:elastos:imwh9khL6uVJtrLcwYGJrAX4CHSSZKuJ9p#primary",
                        "signature": "G5fxZKMfMlCbGhewQaebpeeFAaKYThG7mNZE5iTLrL0x3bFRg78-vkRb7zvAxDS6SGSJvgDYMZd6qY59M1JdGw"
                    }
                },
                "memo": "Published from GetDIDs.com",
                "status": "Completed",
                "createdAt": "2021-08-31T23:19:59.485Z",
                "updatedAt": "2021-08-31T23:20:20.963Z",
                "__v": 0,
                "blockchainTxHash": "0xfb861ddaf27b371a66d0ac456bebe88b23ac95fbfa1f3bfe7e4a8b4b71caa78d",
                "blockchainTxReceipt": {
                    "blockHash": "0xfb226a099e511b1d75ffd33f80441baa2fcfcb6115aecd47e0687683c4ea2853",
                    "blockNumber": 1174647,
                    "contractAddress": null,
                    "cumulativeGasUsed": 113464,
                    "didLog": {
                        "did": "did:elastos:imwh9khL6uVJtrLcwYGJrAX4CHSSZKuJ9p",
                        "operation": "create",
                        "data": "D2VsYXN0b3MvZGlkLzEuMAZjcmVhdGX9TANleUpwWkNJNkltUnBaRHBsYkdGemRHOXpPbWx0ZDJnNWEyaE1OblZXU25SeVRHTjNXVWRLY2tGWU5FTklVMU5hUzNWS09YQWlMQ0p3ZFdKc2FXTkxaWGtpT2x0N0ltbGtJam9pWkdsa09tVnNZWE4wYjNNNmFXMTNhRGxyYUV3MmRWWktkSEpNWTNkWlIwcHlRVmcwUTBoVFUxcExkVW81Y0NOd2NtbHRZWEo1SWl3aWRIbHdaU0k2SWtWRFJGTkJjMlZqY0RJMU5uSXhJaXdpWTI5dWRISnZiR3hsY2lJNkltUnBaRHBsYkdGemRHOXpPbWx0ZDJnNWEyaE1OblZXU25SeVRHTjNXVWRLY2tGWU5FTklVMU5hUzNWS09YQWlMQ0p3ZFdKc2FXTkxaWGxDWVhObE5UZ2lPaUpxVldoTk9URkZia0YwVVdJMlRUYzJSMm96VG5kV1RHVm1aVU5STXpOQlRGVlpPR2wzUVZOeWFubFFjU0o5WFN3aVlYVjBhR1Z1ZEdsallYUnBiMjRpT2xzaVpHbGtPbVZzWVhOMGIzTTZhVzEzYURscmFFdzJkVlpLZEhKTVkzZFpSMHB5UVZnMFEwaFRVMXBMZFVvNWNDTndjbWx0WVhKNUlsMHNJbVY0Y0dseVpYTWlPaUl5TURJMkxUQTRMVE14VkRJek9qRTVPalUyV2lJc0luQnliMjltSWpwN0luUjVjR1VpT2lKRlEwUlRRWE5sWTNBeU5UWnlNU0lzSW1OeVpXRjBaV1FpT2lJeU1ESXhMVEE0TFRNeFZESXpPakU1T2pVMldpSXNJbU55WldGMGIzSWlPaUprYVdRNlpXeGhjM1J2Y3pwcGJYZG9PV3RvVERaMVZrcDBja3hqZDFsSFNuSkJXRFJEU0ZOVFdrdDFTamx3STNCeWFXMWhjbmtpTENKemFXZHVZWFIxY21WV1lXeDFaU0k2SW1GSVUzRmxjRGR4TkZCSExUUTJSM1JIWlZsVGFETm9hVVk0VVhoYVNVbEtiRVJOY0ZFelJsTlRMV1JzWTJGdVUzaFhVRkZaTUZoVE4yNVNUazlpVmpOWU16STBURzFzUTBwTGFHUnVSRVZHVTNGS2VXaDNJbjE5DkVDRFNBc2VjcDI1NnIxNmRpZDplbGFzdG9zOmltd2g5a2hMNnVWSnRyTGN3WUdKckFYNENIU1NaS3VKOXAjcHJpbWFyeVZHNWZ4WktNZk1sQ2JHaGV3UWFlYnBlZUZBYUtZVGhHN21OWkU1aVRMckwweDNiRlJnNzgtdmtSYjd6dkF4RFM2U0dTSnZnRFlNWmQ2cVk1OU0xSmRHdw==",
                        "transactionHash": "0xfb861ddaf27b371a66d0ac456bebe88b23ac95fbfa1f3bfe7e4a8b4b71caa78d",
                        "removed": false
                    },
                    "from": "0x14b1cf2ceecfd04006a57dd060692758aa1ca330",
                    "gasUsed": 113464,
                    "logs": [],
                    "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000020000004000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000",
                    "status": true,
                    "to": "0x46e5936a9baa167b3368f4197edce746a66f7a7a",
                    "transactionHash": "0xfb861ddaf27b371a66d0ac456bebe88b23ac95fbfa1f3bfe7e4a8b4b71caa78d",
                    "transactionIndex": 0
                }
            }
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

### Get new DID tx stats

Get a summary of new DID transactions during a period of time

```bash
token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImtpcmFuIiwiaWF0IjoxNjMwMzUwODI2LCJleHAiOjMyNjEwNjE2NTIsImlzcyI6ImRpZDplbGFzdG9zOmlhZzhxd3ExeFBCcExzR3Y0elI0Q216THBMVWtCTmZQSFgifQ.meX4soGF0s_ugAo-c2tZeQOKTvILJj-ZhZBeXqG5_RQ";
curl http://localhost:2000/v1/eidSidechain/get/didTx/stats?network=mainnet&created=2021-08-31 -H "Authorization: Bearer ${token}"
```

```yaml
Request type: GET
Url: /v1/eidSidechain/get/didTx/stats?network=[mainnet|testnet]&created=[today|yesterday|2021-08-31]
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
            "didTxes": {
                "numTxes": 1,
                "txes": {
                    "GetDIDs.com": 1
                }
            }
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
