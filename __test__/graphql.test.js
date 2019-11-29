const { graphql } = require('graphql');
const {MongoClient} = require('mongodb');
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

    const response = await rp({method: 'POST', uri: API, body: {query}, json: true});
    expect(response).toMatchSnapshot();
  });

  
  test('Add new post and see that it appears in DB', async () => {  
        const mutation = `
            mutation {
                addPost(title: "testing", content: "test123") {    
                    id
                    title
                    content
                }
            }
        `;


    const request = await rp({method: 'POST', uri: API, body: {mutation}, json: true});
    /*
    expect(request).toMatchSnapshot();
   
    const query = `
        query{
            posts {    
                id
                title
                content
            }
        }
    `;

    const response = await rp({method: 'POST', uri: API, body: {query}, json: true});
    expect(response).toMatchSnapshot();
  */  
  });
});
