# Enhanced Instructor Store Documentation

## Overview
The enhanced instructor store provides a comprehensive state management solution for instructor-related functionality in the BlackAndSell platform. Built with Zustand and persistence middleware, it offers robust error handling, validation, and security features.

## Key Features

### 🔐 Authentication & Security
- **Token Management**: Automatic token validation and refresh
- **Secure Storage**: Persistent token storage with localStorage
- **Session Management**: Automatic logout on token expiration
- **Input Validation**: Client-side validation before API calls

### 📊 State Management
- **Centralized State**: All instructor data in one place
- **Optimistic Updates**: Immediate UI updates with rollback on errors
- **Loading States**: Proper loading indicators for all async operations
- **Error Handling**: Comprehensive error handling with user-friendly messages

### 🎯 Core Functionality
- **Profile Management**: Complete instructor profile CRUD operations
- **Course Management**: Full course lifecycle management
- **Withdrawal System**: Secure withdrawal request handling
- **Analytics**: Performance metrics and earnings tracking
- **Notifications**: Real-time notification management

## API Reference

### Authentication Methods

#### `signupInstructor(instructorData, router)`
Creates a new instructor account with comprehensive validation.

**Parameters:**
- `instructorData` (Object): Instructor registration data
- `router` (Object): Next.js router for navigation

**Validation:**
- Email format validation
- Password strength (minimum 8 characters)
- Phone number validation
- Required fields validation

**Example:**
```javascript
const instructorData = {
  fullname: { firstName: "John", lastName: "Doe" },
  email: "john@example.com",
  password: "securePassword123",
  phoneNumber: { countryCode: "+1", number: "1234567890" },
  bio: "Experienced instructor",
  expertise: ["JavaScript", "React"],
  socialLinks: { linkedin: "https://linkedin.com/in/johndoe" },
  avatar: { file: avatarFile }
};

const result = await signupInstructor(instructorData, router);
```

#### `loginInstructor(email, password, router)`
Authenticates instructor and manages session.

**Parameters:**
- `email` (String): Instructor email
- `password` (String): Instructor password
- `router` (Object): Next.js router for navigation

#### `logoutInstructor(router)`
Logs out instructor and clears all data.

#### `checkInstructorAuth()`
Validates current session and updates state.

### Profile Management

#### `updateInstructor(instructorData)`
Updates instructor profile information.

**Enhanced Features:**
- Client-side validation
- Optimistic state updates
- Comprehensive error handling

#### `changePassword(currentPassword, newPassword)`
Changes instructor password with validation.

**Validation:**
- Current password verification
- New password strength requirements
- Minimum 8 characters

#### `uploadAvatar(file)`
Uploads and updates instructor avatar.

**Features:**
- Cloudinary integration
- Automatic state updates
- File validation

#### `getInstructorProfile()`
Retrieves detailed instructor profile information.

### Course Management

#### `createCourseEnhanced(courseData, router)`
Enhanced course creation with comprehensive validation.

**Validation:**
- Title minimum length (5 characters)
- Description minimum length (20 characters)
- Category selection requirement
- Price validation for paid courses

#### `updateCourse(courseId, courseData)`
Updates existing course information.

#### `deleteCourse(courseId)`
Deletes a course and updates state.

#### `duplicateCourse(courseId)`
Creates a copy of an existing course.

#### `bulkDeleteCourses(courseIds)`
Deletes multiple courses in a single operation.

#### `publishCourse(courseId, router)`
Submits course for review and publication.

### Withdrawal Management

#### `createWithdrawal(amount, withdrawMethod, bankDetails)`
Creates a withdrawal request with enhanced security.

**Validation:**
- Minimum withdrawal amount ($100)
- Maximum daily limit ($10,000)
- Bank details validation for bank transfers
- Withdrawal method validation

**Example:**
```javascript
const bankDetails = {
  accountNumber: "1234567890",
  routingNumber: "123456789",
  accountHolderName: "John Doe"
};

const result = await createWithdrawal(500, "bank", bankDetails);
```

#### `fetchWithdrawals(params)`
Retrieves instructor withdrawal history.

#### `cancelWithdrawal(withdrawalId)`
Cancels a pending withdrawal request.

### Analytics & Performance

#### `loadDashboardAnalytics(instructorId)`
Loads comprehensive dashboard analytics.

#### `getCourseAnalytics(courseId)`
Retrieves detailed course analytics.

#### `getCoursePerformance(courseId)`
Gets course performance metrics.

#### `getEarningsSummary(period)`
Retrieves earnings summary for specified period.

### Utility Methods

#### `isTokenValid()`
Validates JWT token expiration.

#### `refreshToken()`
Refreshes authentication token.

#### `clearInstructorData()`
Clears all instructor data (useful for logout).

#### `getNotifications()`
Retrieves instructor notifications.

#### `markNotificationAsRead(notificationId)`
Marks a notification as read.

## State Structure

```javascript
{
  // Authentication
  instructor: Object | null,
  instructorToken: String | null,
  isInstructor: Boolean,
  
  // UI State
  isLoading: Boolean,
  
  // Data
  dashboardStats: Object | null,
  withdrawals: Array,
  courses: Array,
  totalCourses: Number,
}
```

## Error Handling

The store implements comprehensive error handling:

1. **Client-side Validation**: Prevents invalid API calls
2. **API Error Handling**: Graceful handling of server errors
3. **User Feedback**: Toast notifications for all operations
4. **State Rollback**: Reverts optimistic updates on errors
5. **Token Management**: Automatic logout on authentication errors

## Security Features

1. **Token Validation**: JWT token expiration checking
2. **Secure Storage**: Encrypted token storage
3. **Input Sanitization**: Prevents malicious input
4. **Rate Limiting**: Built-in request throttling
5. **Session Management**: Automatic session cleanup

## Usage Examples

### Basic Usage
```javascript
import useInstructorStore from '../store/instructorStore';

function InstructorDashboard() {
  const {
    instructor,
    isLoading,
    courses,
    loadDashboardAnalytics,
    createCourseEnhanced
  } = useInstructorStore();

  useEffect(() => {
    loadDashboardAnalytics(instructor?._id);
  }, [instructor]);

  const handleCreateCourse = async (courseData) => {
    const result = await createCourseEnhanced(courseData, router);
    if (result.success) {
      // Course created successfully
    }
  };

  return (
    <div>
      {isLoading && <LoadingSpinner />}
      {/* Dashboard content */}
    </div>
  );
}
```

### With Error Handling
```javascript
const handleWithdrawal = async () => {
  try {
    const result = await createWithdrawal(amount, method, bankDetails);
    if (result.success) {
      toast.success("Withdrawal request created!");
    } else {
      toast.error(result.message);
    }
  } catch (error) {
    toast.error("An unexpected error occurred");
  }
};
```

## Best Practices

1. **Always check loading states** before showing UI elements
2. **Handle errors gracefully** with user-friendly messages
3. **Validate input** before making API calls
4. **Use optimistic updates** for better UX
5. **Clear sensitive data** on logout
6. **Check token validity** before protected operations

## Migration Guide

### From Old Store
If migrating from the previous instructor store:

1. **Update method calls**: Some method signatures have changed
2. **Add validation**: New validation requirements for some methods
3. **Handle new errors**: Enhanced error handling may require UI updates
4. **Use new methods**: Take advantage of new utility methods

### Breaking Changes
- `updateInstructor` now returns `instructor` instead of `course`
- `createWithdrawal` now requires `bankDetails` for bank transfers
- Enhanced validation may reject previously accepted data

## Performance Considerations

1. **State Optimization**: Only necessary data is persisted
2. **Lazy Loading**: Data is loaded only when needed
3. **Caching**: Intelligent caching for frequently accessed data
4. **Debouncing**: Prevents excessive API calls
5. **Memory Management**: Automatic cleanup of unused data

## Troubleshooting

### Common Issues

1. **Token Expired**: Use `refreshToken()` or redirect to login
2. **Validation Errors**: Check input data format and requirements
3. **Network Errors**: Implement retry logic for failed requests
4. **State Inconsistency**: Use `clearInstructorData()` to reset

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` to see detailed error information.

## Contributing

When adding new methods to the store:

1. **Follow naming conventions**: Use descriptive method names
2. **Add validation**: Include client-side validation
3. **Handle errors**: Implement comprehensive error handling
4. **Update state**: Ensure state consistency
5. **Add documentation**: Document new methods and parameters
6. **Test thoroughly**: Test all error scenarios

## License

This enhanced instructor store is part of the BlackAndSell platform and follows the same licensing terms.
