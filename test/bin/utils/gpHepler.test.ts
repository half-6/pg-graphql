import {GPHelper} from '../../../lib/utils/gpHelper'
describe('GPHelper test', () => {
    it('buildType test', async () => {
        const schema = await $pgHelper.loadDBSchema();
        const gpHelper = new GPHelper(schema);
        const ans = gpHelper.buildType()
        console.log(ans)
        $expect(ans).includes("enum tp_company_status")
        $expect(ans).includes("enum type_gender")
        $expect(ans).includes("type company")
        $expect(ans).includes("company_id:ID!")
    });

    it('buildQuery test', async () => {
        const schema = await $pgHelper.loadDBSchema();
        const gpHelper = new GPHelper(schema);
        const ans = gpHelper.buildQuery()
        console.log(ans)
        $expect(ans).includes("type Query")
        $expect(ans).includes("company ( company_id:ID! ): company!")
        $expect(ans).includes("user ( account_id:ID! ): user!")
    });
});
