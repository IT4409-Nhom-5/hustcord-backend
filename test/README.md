# Hustcord Backend - Mocha Unit Tests

## Overview

This project uses **Mocha** for unit testing with **Chai** for assertions and **Sinon** for mocking and stubbing.


## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage report
```bash
npm run test:cov
```

## Test Coverage

The test suite covers the following key use cases:

### AuthService
- ✅ User registration with validation
- ✅ User login with JWT token generation
- ✅ Password validation against hashed passwords
- ✅ Conflict detection for existing users

### UserService
- ✅ Create new users with email and username
- ✅ Find users by email or ID
- ✅ Update user information
- ✅ Search users by username
- ✅ Prevent duplicate usernames

### MessageService
- ✅ Create messages in channels
- ✅ Retrieve messages by ID
- ✅ Get all messages in a channel (ordered by creation time)
- ✅ Update message content
- ✅ Error handling for missing messages/channels

### ChannelService
- ✅ Get channel details with populated participants
- ✅ Retrieve channels for a specific user
- ✅ Include last message in channel list
- ✅ Handle non-existent channels gracefully

## Notes

- All service tests use stubs/mocks to isolate unit logic
- Tests follow AAA pattern: Arrange, Act, Assert
- Each test case focuses on a single behavior
- Database models are mocked to prevent external dependencies
