const request = require('supertest');
const app = require('./app'); // assuming the express app is imported from app.js
const User = require('./model/userModel'); // assuming the User model is imported from models/User.js
const bcrypt = require('bcrypt');

describe('registerUser', () => {
  it('should return 400 if not all fields are filled in', async () => {
    const res = await request(app)
      .post('/register')
      .send({ firstName: 'John' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Please fill in all fields');
  });

  it('should return 400 if passwords do not match', async () => {
    const res = await request(app)
      .post('/register')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        gender: 'male',
        email: 'john.doe@example.com',
        password: 'password',
        confirmPassword: 'password123',
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Passwords do not match');
  });

  it('should return 400 if user already exists', async () => {
    jest
      .spyOn(User, 'findOne')
      .mockResolvedValue({ email: 'john.doe@example.com' });
    const res = await request(app)
      .post('/register')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        gender: 'male',
        email: 'john.doe@example.com',
        password: 'password',
        confirmPassword: 'password',
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('User already exists');
  });

  it('should return 201 and create user if all conditions are met', async () => {
    jest.spyOn(User, 'findOne').mockResolvedValue(null);
    jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');
    jest.spyOn(User.prototype, 'save').mockResolvedValue();
    const res = await request(app)
      .post('/register')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        gender: 'male',
        email: 'john.doe@example.com',
        password: 'password',
        confirmPassword: 'password',
      });
    expect(res.status).toBe(201);
    expect(res.body.message).toBe('User created successfully');
  });
});

// Unit tests
describe('loginUser', () => {
  it('should return status 400 if email or password is missing', async () => {
    const req = { body: { email: '', password: 'password' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await loginUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Please fill in all fields',
    });
  });

  it('should return status 401 if user with given email does not exist', async () => {
    const req = {
      body: { email: 'nonexistent@example.com', password: 'password' },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await loginUser(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
  });

  it('should return status 401 if password is incorrect', async () => {
    const req = {
      body: { email: 'existing@example.com', password: 'wrongpassword' },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await loginUser(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
  });

  it('should return status 200 with token and userId if login is successful', async () => {
    const req = {
      body: { email: 'existing@example.com', password: 'password' },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    User.findOne = jest
      .fn()
      .mockResolvedValue({ _id: '123', password: 'hashedpassword' });
    bcrypt.compare = jest.fn().mockResolvedValue(true);
    jwt.sign = jest.fn().mockReturnValue('mockedtoken');
    await loginUser(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Login successful!',
      token: 'mockedtoken',
      userId: '123',
    });
  });
});
