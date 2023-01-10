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
			name: name,
			email: email,
			school: ctx.clientIdentity.getID(),
			createdAt: ctx.stub.getTxTimestamp(),
			updatedAt: ctx.stub.getTxTimestamp()
		}
        // Convert data to byte array or buffer stream before saving to blockchain
        const studentBuffer = Buffer.from(JSON.stringify(newStudentObject));
        // putState - stores data to the blockchain
        await ctx.stub.putState(studentKey, studentBuffer);
		return newStudentObject;
    // }
    // 2.Get Student
    // async getStudent(ctx, studentId){
    //     // Re-create composite key to fetch the correct student object
    //     const studentKey = ctx.stub.createCompositeKey('certnet.student',[studentId]);
    //     // Retrieve value from blockchain. It will return data as byte array
    //     const studentBuffer = await ctx.stub.getState(studentKey);
    //     if(studentBuffer){
    //         return JSON.parse(studentBuffer.toString());
    //     } else {
    //         return 'Asset with key '+studentId+' does not exist on network';
    //     }
    // }
    // 3.Issue Certificate
    // 4.Verify Certificate
}

module.exports = CertnetContract;