'use strict'

const helper = require('./contractHelper.js');

async function main(studentId, name, email) {
    try {
        const contract = await helper.getContractInstance();
        const respBuffer = await contract.submitTransaction('createStudent',studentId, name, email);
        const student = JSON.parse(respBuffer.toString());
        console.log(student);
        return student;
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

// main('0001','StudentA','some@email.com');
