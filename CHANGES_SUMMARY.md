# Backend service fixes summary

## What I changed

I fixed the main backend issue causing user-related operations to fail by updating the user service logic without changing unrelated application behavior.

### 1) User creation and update flow
- Fixed the service so creating a user with an existing username no longer creates a duplicate account.
- Updated the save logic to reuse the existing user record and update its role/password safely.
- Normalized usernames by trimming whitespace before saving.

### 2) Password handling
- Passwords are now encoded before being stored.
- Existing already-hashed passwords are preserved instead of being re-encoded.

### 3) Related profile creation
- Student and teacher profile creation still works automatically when the corresponding user role is saved.

## Files changed
- backend/src/main/java/com/example/backend/service/UserService.java
- backend/src/test/java/com/example/backend/service/UserServiceTest.java

## Verification
I verified the fix with:
- Maven test command: ./mvnw -Dtest=UserServiceTest test

Result:
- Tests run: 1
- Failures: 0
- Errors: 0
- Skipped: 0

## Why this was happening
The main issue was in the user service layer. When a new user with the same username was submitted, the backend tried to save a second record and hit a database uniqueness error. That caused user-management actions such as adding/editing users to fail.
