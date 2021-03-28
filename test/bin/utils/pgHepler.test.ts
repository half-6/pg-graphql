describe('PGGraphql API Request', () => {
    it('read DB schema', async () => {
        const schema = await $pgHelper.loadDBSchema();
        console.log(schema.tables["user"])
        console.log(schema.enums["type_gender"])
        console.log(schema.composites["type_struct"])
        $expect(schema.tables["user"].primary_key).with.lengthOf(1)
        $expect(schema.tables["user"].primary_key).include("account_id")
        $expect(schema.composites["type_struct"].columns).have.property("name")

        $expect(schema.enums["type_gender"].columns).with.lengthOf(2);

        $expect(schema.functions["f_check_error"].dataType).equal("boolean")

        $expect(schema.functions["f_check_error"].arguments["issuccess"].type).equal("boolean")
        $expect(schema.functions["f_check_error"].arguments["issuccess"].default).equal(undefined)
        $expect(schema.functions["f_check_error"].arguments["error"].type).equal("character")


        $expect(schema.functions["f_empty"].dataType).equal("boolean")
        $expect(schema.functions["f_empty"].arguments["$param1"].type).equal("boolean")
        $expect(schema.functions["f_empty"].arguments["$param1"].default).equal(undefined)

        $expect(schema.functions["f_empty"].arguments["$param2"].type).equal("boolean")
        $expect(schema.functions["f_empty"].arguments["$param2"].default).equal("true")


        $expect(schema.functions["f_table"].arguments["_company_id"].type).equal("integer")
        $expect(schema.functions["f_table"].arguments["_company_id"].default).equal("1")

    });
});
