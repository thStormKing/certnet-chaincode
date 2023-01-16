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
    // 1. Create Student - studentId, name, email)
    async createStudent(ctx, studentId, name, email) {
        console.log("====================Entered createStudent====================");
        // const studentJSON = JSON.parse(studentIn);
        // console.log(studentJSON);
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
        console.log("====================Exit createStudent====================");
        return newStudentObject;
    }

    // Get student
    async getStudent(ctx, studentId) {
        console.log("====================Entered getStudent====================");
        const studentKey = ctx.stub.createCompositeKey('certnet.student',[studentId]);
        const studentBuffer = await ctx.stub.getState(studentKey);
        if(studentBuffer) {
            console.log("====================Exit getStudent====================");
            return JSON.parse(studentBuffer.toString());
        } else {
            console.log("====================Exit getStudent====================");
            return 'Asset with key ' + studentId + ' does not exist on network.';
        }
    }
    // Issue Certificate
    async issueCertificate(ctx, studentId, courseId, gradeReceived, originalHash){
        console.log("====================Entered issueCertificate====================");
        let msgSender = ctx.clientIdentity.getID();
        let certificateKey = ctx.stub.createCompositeKey('certnet.certificate',[courseId,studentId]);
        let studentKey = ctx.stub.createCompositeKey('certnet.student', [studentId]);

        // Fetch student with given ID from blockchain
        let student = await ctx.stub.getState(studentKey)
        .catch(err => console.log(err));

        // Fetch certificate from blockchain
        let certificate = await ctx.stub.getState(certificateKey)
        .catch(err => console.log(err));

        // Make sure that student exists and certificate does not exist on the network
        if(student.length === 0 || certificate.length !== 0) {
            console.log("====================Exit issueCertificate with error====================");
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
                createdAt: ctx.stub.getTxTimestamp().toDate(),
                updatedAt: ctx.stub.getTxTimestamp().toDate()
            };

            // Convert JSON object to buffer and store in blockchain
            let dataBuffer = Buffer.from(JSON.stringify(certificateObject));
            await ctx.stub.putState(certificateKey,dataBuffer);

            // Return value of new certificate issued to student
            console.log("====================Exit issueCertificate====================");
            return certificateObject;
        }
    }
    // Verify Certificate
    async verifyCertificate(ctx, studentId, courseId, currentHash) {
        console.log("====================Entered verifyCertificate====================");
        let verifier = ctx.clientIdentity.getID();
        let certificateKey = ctx.stub.createCompositeKey('certnet.certificate', [courseId, studentId]);

        console.log('Verifier: '+verifier);
        console.log('OU '+ctx.clientIdentity.getAttributeValue('OU'));

        // Fetch certificate with given ID from blockchain
        let certificateBuffer = await ctx.stub.getState(certificateKey)
        .catch(err => console.log(err));

        // Convert the received certificate buffer to a JSON object
        const certificate = JSON.parse(certificateBuffer.toString());

        // Check if original certificate has matches current hash
        if(certificate === undefined || certificate.originalHash !== currentHash) {
            // Certificate is not valid, issue event notifying the same
            let verificationResult = {
                certificate: courseId+'-'+studentId,
                student: studentId,
                verifier: verifier,
                result: 'xxx - INVALID',
                verifiedOn: ctx.stub.getTxTimestamp().toDate()
            };
            ctx.stub.setEvent('verifyCertificate',Buffer.from(JSON.stringify(verificationResult)));
            console.log("====================Exit verifyCertificate====================");
            return true;
        } else {
            // Certificate is valid, issue event notifying the student application
            let verificationResult = {
                certificate: courseId+'-'+studentId,
                student: studentId,
                verifier: verifier,
                result: '*** - Valid',
                verifiedOn: ctx.stub.getTxTimestamp().toDate()
            };
            ctx.stub.setEvent('verifyCertificate',Buffer.from(JSON.stringify(verificationResult)));
            console.log("====================Exit verifyCertificate====================");
            return true;
        }
    }

    async getAssetTxHistory(ctx, docType, key){
        const userKey = ctx.stub.createCompositeKey('certnet.'+docType, [key]);
        const historyResultIterator = await ctx.stub.getHistoryForKey(userKey)
        .catch(err => console.log(err));

        if(historyResultIterator){
            return await this.iterateResults(historyResultIterator);
        } else {
            return 'Asset with key '+userKey+' does not exist on the network';
        }
    }

    async iterateResults(iterator) {
        let allResults = [];
        while (true){
            let res = await iterator.next();

            if(res.value && res.value.value.toString()) {
                let jsonRes = {};
                console.log(res.value.value.toString());
                jsonRes.Key = res.value.key;
                try {
                    jsonRes.Record = JSON.parse(res.value.value.toString());
                } catch (err) {
                    console.log(err);
                    jsonRes.Record = res.value.value.toString();
                }
                allResults.push(jsonRes);
            }
            if(res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return allResults;
            }
        }
    }
}

module.exports = CertnetContract;