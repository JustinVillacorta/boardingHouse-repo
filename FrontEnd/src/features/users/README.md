# Users Feature - Clean Architecture Implementation

This feature follows **Clean Architecture** principles with **feature-based slicing**, providing a scalable and maintainable structure for user management functionality.

## 🏗️ Architecture Overview

### **Domain Layer** (`domain/`)
- **Entities**: Core business objects and data structures
- **Repositories**: Abstract interfaces defining data access contracts

### **Application Layer** (`application/`)
- **Use Cases**: Business logic and orchestration
- **Services**: Application services that coordinate use cases

### **Infrastructure Layer** (`infrastructure/`)
- **Repository Implementations**: Concrete implementations of domain repositories
- **External API Integration**: Handles communication with backend services

### **Presentation Layer** (`presentation/`)
- **Components**: UI components for user interaction
- **Hooks**: Custom React hooks for state management
- **Pages**: Complete page components

## 📁 File Structure

```
src/features/users/
├── domain/
│   ├── entities/
│   │   └── User.ts                    # User entity and request/response types
│   └── repositories/
│       └── UsersRepository.ts         # Abstract repository interface
├── application/
│   ├── usecases/
│   │   ├── GetUsersUseCase.ts         # Business logic for fetching users
│   │   └── CreateUserUseCase.ts       # Business logic for creating users
│   └── services/
│       └── UsersService.ts            # Application service coordinator
├── infrastructure/
│   └── repositories/
│       └── UsersRepositoryImpl.ts     # Concrete API implementation
├── presentation/
│   ├── components/
│   │   └── CreateUserModal.tsx        # User creation modal component
│   ├── hooks/
│   │   └── useUsers.ts                # Custom hook for user management
│   └── pages/
│       └── UsersPage.tsx              # Complete users management page
├── index.ts                           # Feature exports
└── README.md                          # This documentation
```

## 🔄 Data Flow

1. **UI Component** calls **Custom Hook** (`useUsers`)
2. **Custom Hook** uses **Application Service** (`UsersService`)
3. **Application Service** orchestrates **Use Cases** (`GetUsersUseCase`, `CreateUserUseCase`)
4. **Use Cases** call **Repository Interface** (`UsersRepository`)
5. **Repository Implementation** (`UsersRepositoryImpl`) makes API calls
6. **Data flows back** through the same layers with proper error handling

## 🎯 Key Benefits

### **Separation of Concerns**
- **Domain**: Pure business logic, no external dependencies
- **Application**: Use cases and business rules
- **Infrastructure**: External concerns (API, database)
- **Presentation**: UI and user interaction

### **Testability**
- Each layer can be tested independently
- Use cases can be tested with mock repositories
- Components can be tested with mock hooks

### **Maintainability**
- Changes to API don't affect business logic
- UI changes don't affect business rules
- Easy to add new features or modify existing ones

### **Reusability**
- Use cases can be reused across different UI components
- Repository interfaces can have multiple implementations
- Business logic is independent of presentation

## 🚀 Usage

### **In Components**
```typescript
import { useUsers } from '../features/users';

const MyComponent = () => {
  const { users, isLoading, error, fetchUsers, createUser } = useUsers();
  
  // Use the hook methods
};
```

### **Direct Service Usage**
```typescript
import { UsersService, UsersRepositoryImpl } from '../features/users';

const usersService = new UsersService(new UsersRepositoryImpl());
const users = await usersService.getUsers();
```

## 🔧 Configuration

The feature automatically uses the existing `apiService` from the infrastructure layer, maintaining consistency with the rest of the application.

## 📋 Features Implemented

- ✅ **Get Users**: Fetch and filter staff/tenant users
- ✅ **Create User**: Support for both staff and tenant creation
- ✅ **Form Validation**: Comprehensive client-side validation
- ✅ **Error Handling**: Proper error states and user feedback
- ✅ **Loading States**: Loading indicators for better UX
- ✅ **Type Safety**: Full TypeScript support throughout all layers

## 🔄 Migration from Old Implementation

The old implementation in `view_pages/manager/users_main.tsx` and `components/CreateUserModal.tsx` can be replaced with:

```typescript
// Old import
import UserMain from '../view_pages/manager/users_main';

// New import
import UsersPage from '../features/users/presentation/pages/UsersPage';
```

This provides the same functionality with better architecture, maintainability, and testability.
