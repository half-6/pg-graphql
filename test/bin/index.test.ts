import PGGraphql from '../../lib';
import {graphqlHTTP } from 'express-graphql';

describe('PGGraphql API Request', () => {
    it('Graphql HTTP', async () => {
        const option: PGGraphqlOption = {
            PGConnectionString: process.env.PG,
        };
        const gp = new PGGraphql(option);
        const query = await gp.build();
        $app.use('/graphql', graphqlHTTP(query));
        const res1 = await $request($app)
            .post('/graphql')
            .set('content-type', 'application/json')
            .send(
                {
                    "query":"{ user(account_id:\"1\") { account_id account gender} }"
                }
            )
        console.log(JSON.stringify(res1.body));
        $expect(res1.body.data).have.property("user")
        $expect(res1.body.data.user).have.property("account_id")


        const res2 = await $request($app)
            .post('/graphql')
            .set('content-type', 'application/json')
            .send(
                {
                    "query":"{ users(gender:male) { account_id account gender} }"
                }
            )
        console.log(JSON.stringify(res2.body));
        $expect(res2.body.data).have.property("users")
        $expect(res2.body.data.users.length > 0)
    });

    it('Query Graphql', async () => {
        const option: PGGraphqlOption = {
            PGConnectionString: process.env.PG,
        };
        const gp = new PGGraphql(option);
        const ans1 = await gp.queryGraphql("{ user(account_id:\"1\") { account_id account gender} }")
        console.log(JSON.stringify(ans1.data));
        $expect(ans1.data).have.property("user")
        $expect(ans1.data.user).have.property("account_id")

        //gender is enum type, not string, no need ""
        const ans2 = await gp.queryGraphql("{ users(gender:male) { account_id account gender} }")
        console.log(JSON.stringify(ans2.data));
        $expect(ans2.data).have.property("users")
        $expect(ans2.data.users.length > 0)


        const ans3 = await gp.queryGraphql("{ company(company_id:\"1\") { company_id company_name company_status} }")
        console.log(JSON.stringify(ans3.data));
        $expect(ans3.data).have.property("company")
        $expect(ans3.data.company).have.property("company_id")

        //gender is enum type, not string, no need ""
        const ans4 = await gp.queryGraphql("{ companys(company_status:approved) { company_id company_name company_status} }")
        console.log(JSON.stringify(ans4.data));
        $expect(ans4.data).have.property("companys")
        $expect(ans4.data.companys.length > 0)
    });
});
