'use strict';

const {Contract} = require('fabric-contract-api');

class CertnetContract extends Contract {

    constructor() {
        super('certnet');
    }

    // a.Instantiate
    async instantiate(ctx){
        console.log('Chaincode was successfully deployed.');
    }
    // 1.Create Student
    async createStudent(ctx, studentId, name, email){
        // Composite Keys ->
        const studentKey = ctx.stub.createCompositeKey('certnet.student', [studentId]);
        
        const newStudentObject = {
            docType: 'student',
            studentId: studentId,
            studentName: name,
            studentEmail: email,
            school: ctx.clientIdentity.getId(),
            createdAt: ctx.stub.getTxTimestamp(),
            updatedAt: ctx.stub.getTxTimestamp()
        }
        // Convert data to byte array or buffer stream before saving to blockchain
        const studentBuffer = Buffer.from(JSON.stringify(newStudentObject));
        // putState - stores data to the blockchain
        await ctx.stub.putState(studentId, studentBuffer);
        return newStudentObject;
    }
    // 2.Get Student
    // 3.Issue Certificate
    // 4.Verify Certificate
}

module.exports = CertnetContract;