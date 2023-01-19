'use strict'

const fs = require('fs');
const {Wallets, Wallet} = require('fabric-network');

async function main(certificatePath, keyfilePath) {
    const wallet = await Wallets.newFileSystemWallet('./identity/org1');
    const certificate = fs.readFileSync(certificatePath).toString();
    const privateKey = fs.readFileSync(keyfilePath).toString();
    const identity = {
        credentials: {
            certificate: certificate,
            privateKey: privateKey
        },
        mspId: 'Org1MSP',
        type: 'X.509'
    }
    await wallet.put('ADMIN_ORG1',identity);
    console.log('Successfully added identity to the wallet');
}

// Trigger for the main function to test from CLI.
// Not needed in production

const certPath = '/home/vboxuser/certification-network/test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/signcerts/Admin@org1.example.com-cert.pem';
const keyfilePath = '/home/vboxuser/certification-network/test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore/priv_sk';
main(certPath,keyfilePath);
