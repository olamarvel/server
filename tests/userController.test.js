const request = require('supertest');
const { app } = require('../index');
const client = require('../services/sanityService');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Helper function to create a hashed password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const username = 'teststaff5' + Date.now();
const password = 'teststaff5';

let token; // Token for authentication

beforeAll(async () => {
  // Create a test user
  const hashedPassword = await hashPassword(password);
  const transaction = client.transaction().create({
    _type: 'user',
    username,
    password: hashedPassword,
  });
  await transaction.commit();

  // Generate a token for authentication
  const user = await client.fetch(`*[_type == "user" && username == $username]`, { username });
  const tokenPayload = {
    id: user[0]._id,
    username: user[0].username,
  };
  token = jwt.sign(tokenPayload, process.env.JWT_SECRET);
});

afterAll(async () => {
  // Delete the test user
  const user = await client.fetch(`*[_type == "user" && username == $username]`, { username });
  if (user.length > 0) {
    const transaction = client.transaction().delete(user[0]._id);
    await transaction.commit();
  }
});

// User registration test
describe('User Registration', () => {
  it('should register a new user', async () => {
    // Test user data
    const userData = {
      username,
      password,
    };

    // Make the registration request
    const response = await request(app).post('/user/register').send(userData);

    // Check the response
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('User registered');
  });
});

// User login test
describe('User Login', () => {
  it('should login an existing user', async () => {
    // Test user data
    const userData = {
      username,
      password,
    };

    // Make the login request
    const response = await request(app).post('/user/login').send(userData);

    // Check the response
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Logged in');
    expect(response.body.token).toBeTruthy();
  });

  it('should reject login with invalid credentials', async () => {
    // Test user data with invalid password
    const userData = {
      username,
      password: 'wrongpassword',
    };

    // Make the login request
    const response = await request(app).post('/user/login').send(userData);

    // Check the response
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Invalid credentials');
  });
});

// Add URL test
describe('Add URL', () => {
  it('should add a URL to the user stats', async () => {
    // Test URL data
    const urlData = {
      url: 'https://example.com/tyr',
    };

    // Make the add URL request with token in the request body
    const response = await request(app)
      .post('/user/add-url')
      .send({ ...urlData, token });

    // Check the response
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('URL added');
  });

  it('should return an error if the URL already exists', async () => {
    // Test URL data that already exists
    const urlData = {
      url: 'https://example.com/tyr',
    };

    // Make the add URL request with token in the request body
    const response = await request(app)
      .post('/user/add-url')
      .send({ ...urlData, token });

    // Check the response
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('URL already exists');
  });
});

describe('Fetch User Stats', () => {
  it('should fetch user stats', async () => {
    const url = '/user/fetch-stats/' + token;
    console.log(url);
    // Make the fetch user stats request with token in the request header
    const response = await request(app)
      .get(url)
      // .set('Authorization', `Bearer ${token}`);

    // Check the response
    expect(response.statusCode).toBe(200);
    expect(response.body.totalClicks).toBeDefined();
    expect(response.body.stats).toBeDefined();
  });
});
