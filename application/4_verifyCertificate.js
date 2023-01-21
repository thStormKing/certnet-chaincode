'use strict'

const helper = require('./contractHelper.js');

async function main(studentId, courseId, currentHash) {
    try {
        const contract = await helper.getContractInstance();
        // This is the process to listen for events.
        const listener = async (event) => {
            // console.log('Listener: ',event);
            if(event.eventName === 'verifyCertificate') {
                const payload = JSON.parse(event.payload.toString());
                console.log(payload);
            }
        }
        contract.addContractListener(listener);
        const respBuffer = await contract.submitTransaction('verifyCertificate',studentId, courseId, currentHash);
        console.log('Execution successful');
        return JSON.parse(respBuffer.toString());
    }
    catch (e) {
        console.log(e);
    }
    finally {
        helper.disconnect();
    }
}

// Trigger for the main function to test from CLI.
// Not needed in production

// main('0001', 'C1', 'asdfghi');
