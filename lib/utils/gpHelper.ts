import { graphql, buildSchema } from 'graphql'

export class GPHelper{
    dbSchema:DBSchema;
    PG2GPDataTypeMap = {
        "int4":"Int",
        "int4[]":"[Int]",
        "int8":"Int",
        "int8[]":"[Int]",
        "numeric":"Float",
        "bit":"Boolean",
        "timestamptz":"String",
        "varchar":"String",
    }

    constructor(dbSchema:DBSchema){
        this.dbSchema = dbSchema;
    }

    public buildQuery():string{
        const ans:string[] = [];
        ans.push("type Query {")
        for(const tableName in this.dbSchema.tables){
            ans.push("  " + this.buildSingleQuery(this.dbSchema.tables[tableName]))
            ans.push("  " + this.buildListQuery(this.dbSchema.tables[tableName]))
        }
        ans.push("}")
        return ans.join("\r\n");
    }
    public buildSingleQuery(table:TableSchema):string{
        const ans:string[] = [];
        ans.push(table.name);
        ans.push("(");
        table.primary_key.forEach((key)=>{
            ans.push(`${key}:${this.PG2GPDataTypeMapConvert(table.columns[key])}!`);
        })
        ans.push("):");
        ans.push(`${table.name}!`);
        return ans.join(" ");
    }
    public buildListQuery(table:TableSchema):string{
        const ans:string[] = [];
        ans.push(`${table.name}s`);
        ans.push("(");
        for(const columnName in table.columns){
            ans.push(`${columnName}:${this.PG2GPDataTypeMapConvert(table.columns[columnName])}`);
        }
        ans.push("):");
        ans.push(`[${table.name}!]!`);
        return ans.join(" ");
    }


    public buildType(){
        const ans:string[] = [];
        for(const key in this.dbSchema.enums)
        {
            this.buildEnumType(this.dbSchema.enums[key],ans)
        }
        for(const key in this.dbSchema.tables)
        {
            this.buildTableType(this.dbSchema.tables[key],ans)
        }
        return ans.join("\r\n");
    }
    public buildEnumType(schema:EnumSchema,ans:string[] = []):string{
        ans.push(`enum ${schema.name}{`)
        for(const columnName in schema.columns)
        {
            const column = schema.columns[columnName];
            ans.push(`  ${column}`)
        }
        ans.push("}")
        return ans.join("\r\n");
    }
    public buildTableType(schema:TableSchema,ans:string[] = []):string{
        ans.push(`type ${schema.name}{`)
        for(const columnName in schema.columns)
        {
             const column = schema.columns[columnName];
             ans.push(`  ${columnName}:${this.PG2GPDataTypeMapConvert(column)}${column.is_primary_key?"!":""}`)
        }
        ans.push("}")
        return ans.join("\r\n");
    }
    private PG2GPDataTypeMapConvert(column:ColumnSchema):string{
        if(column.is_primary_key)
        {
            return "ID"
        }
        if(this.PG2GPDataTypeMap[column.type])
        {
            return this.PG2GPDataTypeMap[column.type]
        }
        if(column.data_type === "USER-DEFINED")
        {
            if(this.dbSchema.enums[column.type])
            {
                return column.type;
            }
        }
        return "String";
    }
}
