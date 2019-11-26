const { graphql } = require('graphql');
const {MongoClient} = require('mongodb');

const schema = require('../graphql/schema');
const post = require('../models/post/post');
const credentials = require('../credentials');

var rp = require('request-promise');
const API = 'http://localhost:5000/graphql'

describe('Testing Database + GraphQL', () => {
  let connection;
  let db;

  beforeAll(async () => {
    connection = await MongoClient.connect(credentials.MONGO_URI, { 
        useUnifiedTopology: true,
        useNewUrlParser: true
     });
    db = await connection.db('graphql');

  });

  afterAll(async () => {
    await connection.close();
    await db.close();
  });

  
  test('Query with GraphQL', async () => {
    //language=GraphQL
    const query = `
        query{
            posts {    
                id
                title
                content
            }
        }
    `;

    const rootValue = {};
    const context = () => ({id, title, content})
  
    const response = await rp({method: 'POST', uri: API, body: {query}, json: true});
    expect(response).toMatchSnapshot();

    //const result = await graphql(schema, query, rootValue, context);
    //console.log(result)
  });
});
