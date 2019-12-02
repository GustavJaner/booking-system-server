const {MongoClient} = require('mongodb');
const credentials = require('../credentials');
const Booking = require('../models/booking/booking');
const Room = require('../models/room/room');

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


  test('Adding a new Booking to testing DB and checks that data is added and valid', async () => {
    const booking = db.collection('booking');
    const bookingData = {startTime: "10.00", endTime: "11.30", date: "måndag", userId: "5ddd2243ce955abae1ba844c", roomId: "5dde3bdd7ef98ac5f9b3fd8f"}; 
    const newBooking = new Booking(bookingData);  
    await booking.insertOne(newBooking)
    const savedBooking = await booking.findOne(newBooking);

    expect(savedBooking._id).toBeDefined();
    expect(savedBooking.startTime).toBe(bookingData.startTime);
    expect(savedBooking.endTime).toBe(bookingData.endTime);
    expect(savedBooking.date).toBe(bookingData.date);
    expect(savedBooking.userId).toBe(bookingData.userId);
    expect(savedBooking.roomId).toBe(bookingData.roomId);
  });

    
  test('You should not be able to add in any field that is not defined in the schema', async () => {
    const booking = db.collection('booking');
    const bookingWithInvalidField = new Booking({date: 'Tisdag', gender: 'Male', nickname: 'tday' });
    await booking.insertOne(bookingWithInvalidField)
    const savedBookingWithInvalidField = await booking.find(bookingWithInvalidField);

    expect(savedBookingWithInvalidField.gender).toBeUndefined();
    expect(savedBookingWithInvalidField.nickkname).toBeUndefined();
  });
  /*
  test('Adding a new Room to DB', async () => {
    const room = db.collection('room');
    const roomData = {start: "", end: "", duration: 30, name: "", adress: "", description: "mamma", serviceId: ""};
    const newRoom = new Room(roomData);
    await room.insertOne(newRoom)
    const savedRoom = await room.findOne(newRoom);

    expect(savedRoom._id).toBeDefined();
    expect(savedRoom.start).toBe(roomData.start);
    expect(savedRoom.end).toBe(roomData.end);
    expect(savedRoom.duration).toBe(roomData.duration);
    expect(savedRoom.name).toBe(roomData.name);
    expect(savedRoom.adress).toBe(roomData.adress);
    expect(savedRoom.description).toBe(roomData.description);

  }); */

  test('should insert a testUser into collection', async () => {
  const users = db.collection('users');
  const mockUser = {_id: "1" , name: 'Stoffe'};
  await users.insertOne(mockUser);

  const insertedUser = await users.findOne({_id: '1'});
  expect(insertedUser).toEqual(mockUser);
  });
});
