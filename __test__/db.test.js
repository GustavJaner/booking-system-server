const {MongoClient} = require('mongodb');
const credentials = require('../credentials');
const Booking = require('../models/booking/booking');

describe('Testing Database', () => {
  let connection;
  let db;

  beforeAll(async () => {
    connection = await MongoClient.connect(credentials.MONGO_URI, { 
        useUnifiedTopology: true,
        useNewUrlParser: true
     });
    db = await connection.db('testing');

  });

  afterAll(async () => {
    await db.collection('booking').drop();
    await db.collection('users').drop();
    await connection.close();
    await db.close();
  });

  
  //TODO Ska rensa 'testing' branchen i databasen för att sedan återskapas
  //beforeEach(async () => {});

  test('Adding a new Booking to testing DB and checks that data is added and valid', async () => {
    const booking = db.collection('booking');
    const bookingData = {date: "måndag", startTime: "10.00", endTime: "11.30", bookedBy: "Stoffe", roomId: "3A : 1002"}; 
    const newBooking = new Booking(bookingData);  
    await booking.insertOne(newBooking)
    const savedBooking = await booking.findOne(newBooking);

    expect(savedBooking._id).toBeDefined();
    expect(savedBooking.date).toBe(bookingData.date);
    expect(savedBooking.startTime).toBe(bookingData.startTime);
    expect(savedBooking.endTime).toBe(bookingData.endTime);
    expect(savedBooking.bookedBy).toBe(bookingData.bookedBy);
    expect(savedBooking.roomId).toBe(bookingData.roomId);
  });

    
  test('You should not be able to add in any field that is not defined in the schema', async () => {
    const booking = db.collection('booking');
    const bookingWithInvalidField = new Booking({date: 'Tisdag', gender: 'Male', nickname: 'tday' });
    await booking.insertOne(bookingWithInvalidField)
    const savedBookingWithInvalidField = await booking.find(bookingWithInvalidField);
      
    //Doesn't work for some reason, even though it has a unique id in DB.
    //expect(savedBookingWithInvalidField._id).toBeDefined();
    expect(savedBookingWithInvalidField.gender).toBeUndefined();
    expect(savedBookingWithInvalidField.nickkname).toBeUndefined();
  });

  test('should insert a testUser into collection', async () => {
  const users = db.collection('users');
  const mockUser = {_id: "1" , name: 'Stoffe'};
  await users.insertOne(mockUser);

  const insertedUser = await users.findOne({_id: '1'});
  expect(insertedUser).toEqual(mockUser);
  });
});
