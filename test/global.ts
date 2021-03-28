import chai from 'chai';
import chaiHttp from 'chai-http';
import express from 'express';
import assert from "assert";
import * as core from "express-serve-static-core";
import {PGHelper} from "../lib/utils/pgHelper";
chai.use(chaiHttp);
declare global {
    const $port: string;
    const $app: core.Express;
    const $request: Chai.ChaiHttpRequest;
    const $should:Chai.Should;
    const $expect:Chai.ExpectStatic;
    const $assert:any;
    const $pgHelper:PGHelper;
}

const _global = global as any;
_global.$port = 3000;
_global.$app = express();
_global.$request = chai.request;
_global.$should = chai.should();
_global.$expect = chai.expect;
_global.$assert = assert;
_global.$pgHelper = new PGHelper({
    PGConnectionString:process.env.PG
})
console.log('****** init unit test global completed ******');
