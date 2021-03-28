/* eslint-disable no-undef */
'use strict';
exports.mochaHooks = {
    beforeAll(done) {
        // do something before every test
        console.log(`🚀 App listening on the port ${$port}`);
        done();
    },
    afterAll(done) {
        console.log('🚀 App server stopped!');
        done();
    },
};
