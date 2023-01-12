
'use strict';

const {Contract} = require('fabric-contract-api');

class CertnetContract extends Contract {
	
	constructor() {
		super('certnet');
	}
	
	// a. Instantiate
	async instantiate(ctx) {
		console.log('Chaincode was successfully deployed.');
	}
	// 1. Create Student
	async createStudent(ctx, studentId, name, email) {
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
		const studentBuffer = Buffer.from(JSON.stringify(newStudentObject));
		// putState
		await ctx.stub.putState(studentKey, studentBuffer);
		return newStudentObject;
	}

	// 2. Get Student
	async getStudent(ctx, studentId) {
		const studentKey = ctx.stub.createCompositeKey('certnet.student', [studentId]);
		const studentBuffer = await ctx.stub.getState(studentKey);
		if (studentBuffer) {
			return JSON.parse(studentBuffer.toString());
		} else {
			return 'Asset with key ' + studentId + ' does not exist on the network';
		}
	}
}

module.exports = CertnetContract;
