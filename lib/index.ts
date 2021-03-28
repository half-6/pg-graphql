'use strict';
/**
 * Module Name: pg-graphql
 * Project Name: LinkFuture.pg-graphql
 * Created by Cyokin on 4/10/2017
 */

import logger from './utils/logger';
import {GPHelper} from './utils/gpHelper';
import {PGHelper} from './utils/pgHelper';
import { graphql, buildSchema } from 'graphql'
import {GraphQLSchema} from "graphql/type/schema";

interface PGGraphqlSchema{
    schema: GraphQLSchema,
    rootValue:any
}

class PGGraphql {
    public options: PGGraphqlOption;
    pgHelper:PGHelper
    constructor(options: PGGraphqlOption) {
        logger('🚀 Starting LinkFuture PostgreSQL Graphql');
        this.options = options;
        this.pgHelper = new PGHelper(this.options);
    }
    public async build():Promise<PGGraphqlSchema>{
        const dbSchema = await this.pgHelper.loadDBSchema();
        const gpHelper = new GPHelper(dbSchema);
        const schema = buildSchema(
            `
              ${gpHelper.buildType()}  
              ${gpHelper.buildQuery()}  
              `
        );
        const rootValue = {}
        for(const tableName in dbSchema.tables){
            rootValue[tableName] = async (args:any)=>{
                return await this.pgHelper.one(tableName,args);
            }
            rootValue[`${tableName}s`] = async (args:any)=>{
                return await this.pgHelper.query(tableName,args);
            }
        }
        return {
            schema,
            rootValue
        }
    }
    public async queryGraphql(query:string){
        const res = await this.build();
        return graphql(res.schema, query, res.rootValue)
    }
}

export default PGGraphql;
