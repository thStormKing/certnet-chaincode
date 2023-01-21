'use strict'

const helper = require('./contractHelper.js');

async function main(studentId, courseId, gradeReceived, originalHash) {
    try {
        const contract = await helper.getContractInstance();
        const respBuffer = await contract.submitTransaction('issueCertificate',studentId, courseId, gradeReceived, originalHash);
        const certificate = JSON.parse(respBuffer.toString());
        console.log(certificate);
        return certificate;
    }
    catch (e) {
        console.log(e);
    }
    finally {
        helper.disconnect();
    }
}

module.exports.execute = main;

// Trigger for the main function to test from CLI.
// Not needed in production

// main('00001', 'C1', 'A', 'asdfgh');
