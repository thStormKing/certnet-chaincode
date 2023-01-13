'use strict';

const {Contract} = require('fabric-contract-api');

class CertnetContract extends Contract {

    constructor() {
        super('certnet');
    }
    // Instantiate
    async instantiate(ctx) {
        console.log('Chaincode deployed successfully');
    }
    // 1. Create Student
    async createStudent(ctx, studentId, name, email) {
        const studentKey = ctx.stub.createCompositeKey('certnet.student',[studentId]);
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
        await ctx.stub.putState(studentKey,studentBuffer);
        return newStudentObject;
    }

    // Get student
    async getStudent(ctx, studentId) {
        const studentKey = ctx.stub.createCompositeKey('certnet.student',[studentId]);
        const studentBuffer = await ctx.stub.getState(studentKey);
        if(studentBuffer) {
            return JSON.parse(studentBuffer.toString());
        } else {
            return 'Asset with key ' + studentId + 'does not exist on network.';
        }
    }
    // Issue Certificate
    async issueCertificate(ctx, studentId, courseId, gradeReceived, originalHash){
        let msgSender = ctx.clientIdentity.getID();
        let certificateKey = ctx.stub.createCompositeKey('certnet.certificate',[courseId]);
        let studentKey = ctx.stub.createCompositeKey('certnet.student', [studentId]);

        // Fetch student with given ID from blockchain
        let student = await ctx.stub.getState(studentKey)
        .catch(err => console.log(err));

        // Fetch certificate from blockchain
        let certificate = await ctx.stub.getState(certificateKey)
        .catch(err => console.log(err));

        // Make sure that student exists and certificate does not exist on the network
        if(student.length === 0 || certificate.length !== 0) {
            throw new Error('Invalid Student ID: '+ studentId +' or CourseID: '+ courseId+'. Either student does not exist on network or certificate already exists.');
        } else {
            let certificateObject = {
                docType: 'certificate',
                studentId: studentId,
                courseId: courseId,
                teacher: msgSender,
                certId: courseId+'-'+studentId,
                originalHash: originalHash,
                grade: gradeReceived,
                createdAt: ctx.stub.getTxTimestamp(),
                updatedAt: ctx.stub.getTxTimestamp()
            };

            // Convert JSON object to buffer and store in blockchain
            let dataBuffer = Buffer.from(JSON.stringify(certificateObject));
            await ctx.stub.putState(certificateKey,dataBuffer);

            // Return value of new certificate issued to student
            return certificateObject;
        }
    }
    // Verify Certificate
}

module.exports = CertnetContract;