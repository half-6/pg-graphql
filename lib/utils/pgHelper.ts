import $logger from "./logger";
import $fs from 'fs';
import $path from 'path';
import $pgPromise from 'pg-promise';
import {IInitOptions, IDatabase, IMain} from 'pg-promise';
import {Diagnostics} from "./diagnostics";


const $allColumns = $fs
    .readFileSync($path.join(__dirname, '../sql/find-table-views-columns.sql'))
    .toString();

const $allCompositeColumns = $fs
    .readFileSync($path.join(__dirname, '../sql/find-composite-columns.sql'))
    .toString();
const $allEnumColumns = $fs
    .readFileSync($path.join(__dirname, '../sql/find-enum-columns.sql'))
    .toString();
const $allFunctions = $fs
    .readFileSync($path.join(__dirname, '../sql/find-functions.sql'))
    .toString();

export class PGHelper {
    options: PGGraphqlOption;
    private static connectionCache = new Map<string,any>();
    initOptions:IInitOptions = {
        query(e: any) {
            $logger('QUERY RESULT:', e.query);
        },
        receive(data: any, result: any, e: any) {
            $logger(`DATA FROM QUERY ${e.query} WAS RECEIVED.`);
        }
    }
    pgp: IMain = $pgPromise(this.initOptions);
    db: IDatabase<any>;
    schema:DBSchema;

    constructor(options: PGGraphqlOption) {
        // super()
        this.options = options;
        if(!PGHelper.connectionCache.has(this.options.PGConnectionString))
        {
            $logger(`Connecting ${options.PGConnectionString}`);
            this.db = this.pgp(options.PGConnectionString);
            PGHelper.connectionCache.set(options.PGConnectionString,this.db);
            Diagnostics.init(this.initOptions);
        }
        this.db = PGHelper.connectionCache.get(this.options.PGConnectionString);
    }

    public async query<T>(tableName:string, where:Hash<any>):Promise<T>{
        const table = this.schema.tables[tableName];
        const parameters:Hash<any> = {};
        const sql = this.buildSelect(table,where,parameters)
        console.log(`QUERY ${sql}`)
        return await this.db.query(sql,parameters);
    }
    public async one<T>(tableName:string, where:Hash<any>):Promise<T>{
        const table = this.schema.tables[tableName];
        const parameters:Hash<any> = {};
        const sql = this.buildSelect(table,where,parameters)
        console.log(`QUERY ${sql}`)
        return await this.db.one(sql,parameters);
    }

    public buildSelect(table:TableSchema, where:Hash<any>, parameters:Hash<any>):string
    {
        const sql = [];
        sql.push('SELECT');
        sql.push('*');
        sql.push('FROM');
        sql.push(`${table.schema}.${table.name}`);
        sql.push('WHERE');
        sql.push(this.buildWhere(table,where,parameters));
        return sql.join(' ');
    }

    public buildWhere(table:TableSchema, where:Hash<any>, parameters:Hash<any>):string
    {
        const sql = [];
        for(const name in where)
        {
            if(table.columns[name])
            {
                const column = table.columns[name];
                const parameterName = this.addParameter(parameters, column, where[name]);
                sql.push(`${column.column_name} = ${parameterName}::${column.type}`)
            }
        }
        return sql.join(' AND ');
    }

    public addParameter(parameters:Hash<any>, column:ColumnSchema, value:any):string
    {
        //composite
        if (value && column.isComposite) {
            return this.buildStructValue(parameters, column, value);
        } else {
            let index = 1;
            let name = column.column_name;
            while (parameters[name]) {
                name += index++;
            }
            parameters[name] = this.buildValue(column, value);
            return `$[${name}]`;
      }
    }
    public buildValue(column:ColumnSchema, value:any):any {
        if (value == null) {
            return value;
        }
        switch (column.type) {
            case 'bit':
                // eslint-disable-next-line no-case-declarations
                const bit = value.toString().toLowerCase();
                return bit === 'true' || bit === '1' || bit === 't' ? 1 : 0;
            case 'json':
            case 'jsonb':
                return typeof value === 'object' ? JSON.stringify(value) : value;
        }
        return value;
    }
    public buildStructValue(parameters:Hash<any>, column:ColumnSchema, json):string{
        const output = [];
        const compositeColumns = this.getCompositeColumn(column);
        for (const name in compositeColumns) {
            const columnValue = json[name];
            const subColumn = compositeColumns[name];
            const parameterName = this.addParameter(parameters, subColumn, columnValue);
            output.push(`${parameterName}::${subColumn.type}`);
        }
        return `(${output.join(',')})`;
    }

    public getCompositeColumn(column:ColumnSchema):Hash<ColumnSchema>
    {
        if(column.isComposite)
        {
            return this.schema.composites[column.data_type].columns
        }
        return null;
    }

    //region load schema
    public async loadDBSchema(): Promise<DBSchema>{
        this.schema = <DBSchema>{};
        this.schema.composites = await this.readCompositeSchema();
        this.schema.tables = await this.readTableAndViewSchema();
        this.schema.enums = await this.readEnumSchema();
        this.schema.functions = await this.readFunctionSchema();

        return this.schema;
    }

    public async readCompositeSchema():Promise<Hash<CompositeSchema>> {
        //TODO:nest composite doesn't support
        const compositeColumns = await this.db.query($allCompositeColumns);
        const compositeList = <Hash<CompositeSchema>>{};

        for (const columnIndex in compositeColumns) {
            const column = compositeColumns[columnIndex];
            if (!compositeList[column.udt_name]) {
                compositeList[column.udt_name] = {
                    columns: {},
                    schema: column.udt_schema,
                    name: column.udt_name
                };
                $logger(`read composite ${column.udt_name} schema success`);
            }
            const composite = compositeList[column.udt_name];
            composite.columns[column.column_name] = column;
        }
        $logger(
            `read ${Object.keys(compositeList).length} composite type schema success`
        );
        return compositeList;
    }

    public async readTableAndViewSchema():Promise<Hash<TableSchema>>{
        const columns = await this.db.query($allColumns);
        const output = <Hash<TableSchema>>{};

        for (const columnIndex in columns) {
            const column = columns[columnIndex];
            if (!output[column.table_name]) {
                output[column.table_name] = {
                    columns: {},
                    schema: column.table_schema,
                    name: column.table_name,
                    primary_key: []
                };
                $logger(
                    `read ${column.table_type} ${column.table_name} schema success`
                );
            }
            const table = output[column.table_name];
            //avoid duplicate column in same table
            if(!table.columns[column.column_name])
            {
                table.columns[column.column_name] = column;
                if (
                    column.data_type === 'USER-DEFINED' &&
                    this.schema.composites[column.type]
                ) {
                    column.isComposite = true;
                }
                column.is_primary_key && table.primary_key.push(column.column_name);
            }
        }
        $logger(
            `read ${Object.keys(output).length} table and view type schema success`
        );
        return output;
    }

    public async readEnumSchema():Promise<Hash<EnumSchema>> {
        const enumColumns = await this.db.query($allEnumColumns);
        const enumList = <Hash<EnumSchema>>{};
        for (const columnIndex in enumColumns) {
            const column = enumColumns[columnIndex];
            if (!enumList[column.enum_type]) {
                enumList[column.enum_type] = {
                    columns: [],
                    schema: null,
                    name: column.enum_type
                };
                $logger(`read enum ${column.enum_type} schema success`);
            }
            const enum_item = enumList[column.enum_type];
            enum_item.columns.push(column.enum_label);
        }
        $logger(
            `read ${Object.keys(enumList).length} enum type schema success`
        );
        return enumList;
    }

    public async readFunctionSchema():Promise<Hash<FunctionSchema>> {
        const functionColumns = await this.db.query($allFunctions);
        const output = {};
        for (const columnIndex in functionColumns) {
            const column = functionColumns[columnIndex];
            output[column.routine_name] = {
                schema: column.routine_schema,
                name: column.routine_name,
                dataType: column.data_type,
                arguments: this.argumentsParser(column.arguments),
                language: column.external_language
            };
        }
        $logger(`read ${Object.keys(output).length} function schema success`);
        return output;
    }

    public argumentsParser(argumentsStr):Hash<FunctionArgument> {
        const output = <Hash<FunctionArgument>>{};
        const functionArgs = argumentsStr.split(',');
        for (let i = 0; i < functionArgs.length; i++) {
            const arg = functionArgs[i].trim().split(' ');
            const hasDefaultValue = arg.indexOf('DEFAULT') > 0;
            if (
                (!hasDefaultValue && arg.length > 1) ||
                (hasDefaultValue && arg.length > 3)
            ) {
                output[arg[0]] = {
                    type: arg[1],
                    default: this.getDefaultValue(arg)
                };
            } else {
                output[`$param${i + 1}`] = {
                    type: arg[0],
                    default: this.getDefaultValue(arg)
                };
            }
        }
        return output;
    }

    public getDefaultValue(arg):string{
        const defaultIndex = arg.indexOf('DEFAULT');
        if (defaultIndex > 0) {
            const defaultValue = arg[arg.indexOf('DEFAULT') + 1].split('::')[0];
            return defaultValue === 'NULL' ? null : defaultValue;
        }
        return undefined;
    }
    //endregion
}
