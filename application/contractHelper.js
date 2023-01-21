'use strict'

const fs = require('fs');
const {Wallets, Gateway} = require('fabric-network');
const yaml = require('js-yaml');
const { mainModule } = require('process');
let gateway;

async function getContractInstance() {
    gateway = new Gateway();

    const connectionProfile = yaml.load(fs.readFileSync('./connection-org1.yaml','utf8'));
    const wallet = await Wallets.newFileSystemWallet('./identity/org1');
    const gatewayoptions = {
        wallet: wallet,
        identity: 'ADMIN_ORG1',
        discovery: {
            enabled: true,
            asLocalhost: true
        }
    }
    await gateway.connect(connectionProfile, gatewayoptions);

    const channel = await gateway.getNetwork('mychannel');
    return channel.getContract('certnet','certnet');
}

function disconnect() {
    gateway.disconnect();
}

module.exports.getContractInstance = getContractInstance;
module.exports.disconnect = disconnect;