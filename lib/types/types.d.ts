
interface PGGraphqlOption {
    PGConnectionString: string;
    Table?: boolean;
}
interface Hash<T>{
    [tableName:string]:T
}
interface ColumnSchema {
    is_primary_key:boolean;
    type: string;
    data_type: string;
    table_schema: string;
    table_name: string;
    column_name: string;
    isComposite:boolean;
}

interface TableSchema{
    columns:Hash<ColumnSchema>;
    name:string;
    schema:string;
    primary_key:string[]
}

interface CompositeSchema{
    columns:Hash<ColumnSchema>;
    name:string;
    schema:string;
}

interface EnumSchema{
    columns:string[];
    name:string;
    schema:string;
}

interface FunctionArgument{
    type:string;
    default:string;
}

interface FunctionSchema{
    columns:string[];
    name:string;
    dataType:string;
    schema:string;
    language:string;
    arguments:Hash<FunctionArgument>
}

interface DBSchema{
    tables:Hash<TableSchema>;
    composites:Hash<CompositeSchema>;
    enums:Hash<EnumSchema>;
    functions:Hash<FunctionSchema>;
}

