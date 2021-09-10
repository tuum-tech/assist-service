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

### Retrieve the latest block info

Get the latest block info from the EID sidechain

```bash
token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImtpcmFuIiwiaWF0IjoxNjMwMzUwODI2LCJleHAiOjMyNjEwNjE2NTIsImlzcyI6ImRpZDplbGFzdG9zOmlhZzhxd3ExeFBCcExzR3Y0elI0Q216THBMVWtCTmZQSFgifQ.meX4soGF0s_ugAo-c2tZeQOKTvILJj-ZhZBeXqG5_RQ";
curl http://localhost:2000/v1/eidSidechain/get/blockInfo/latest?network=mainnet -H "Authorization: Bearer ${token}"
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
            "_id": "613ab7d08b9074fc6a2a3951",
            "chain": "eidSidechain",
            "network": "mainnet",
            "extraInfo": {
                "rpcUrl": "https://api.elastos.io/eid",
                "backupRpcUrl": "https://api.trinity-tech.cn/eid",
                "chainId": 22,
                "genesisBlockHash": "0x7d0702054ad68913eff9137dfa0b0b6ff701d55062359deacad14859561f5567",
                "depositAddress": "XUgTgCnUEqMUKLFAg3KhGv1nnt9nn8i3wi",
                "withdrawContractAddress": "0x6F60FdED6303e73A83ef99c53963407f415e80b9",
                "didContractAddress": "0x46E5936a9bAA167b3368F4197eDce746A66f7a7a"
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
