# Dashboard Feature - Clean Architecture Implementation

This dashboard feature follows Clean Architecture principles with feature-based slicing.

## Architecture Overview

```
src/features/dashboard/
├── domain/                 # Business entities and interfaces
│   ├── entities/          # Business entities/models
│   └── repositories/      # Repository interfaces
├── infrastructure/        # External integrations
│   └── repositories/     # API implementation
├── application/          # Use cases and business logic
│   ├── usecases/        # Individual use cases
│   └── services/        # Business services
└── presentation/        # UI components and hooks
    ├── components/      # Reusable UI components
    └── hooks/          # React hooks for data management
```

## Key Features

### Real-time Dashboard Analytics
- **Room Occupancy**: Live occupancy rates with visual charts
- **Tenant Statistics**: Active tenants and lease management
- **Payment Analytics**: Revenue tracking and collection rates
- **Maintenance Requests**: Request status and resolution tracking

### Data Visualization
- Interactive pie charts for room occupancy
- Line charts for payment trends
- Real-time statistics cards
- Responsive design with loading and error states

### Technical Implementation

#### Domain Layer
- **Entities**: TypeScript interfaces for all data models
- **Repository Interfaces**: Clean contracts for data access

#### Infrastructure Layer
- **API Repository**: Implementation using existing `apiService.js`
- **Type-safe Integration**: TypeScript interfaces for JavaScript modules

#### Application Layer
- **Use Cases**: Single-responsibility business operations
- **Dashboard Service**: Orchestrates multiple use cases

#### Presentation Layer
- **useDashboard Hook**: React hook for state management
- **Integration**: Enhanced existing UI components with real data

## Usage

```typescript
import { useDashboard } from '../../features/dashboard/presentation/hooks/useDashboard';

const { data, loading, error, refreshData } = useDashboard();

// Access real-time data
const totalRooms = data.occupancy?.totalRooms || 0;
const activetenants = data.stats?.tenants?.active || 0;
const monthlyRevenue = data.payments?.thisMonth?.amount || 0;
```

## Benefits

1. **Separation of Concerns**: Each layer has a single responsibility
2. **Testability**: Easy to unit test individual components
3. **Maintainability**: Changes in one layer don't affect others
4. **Scalability**: Easy to add new features following the same pattern
5. **Type Safety**: Full TypeScript coverage with proper interfaces

## Backend API Integration

The dashboard integrates with these backend endpoints:
- `GET /api/dashboard/stats` - Overview statistics
- `GET /api/dashboard/occupancy` - Room occupancy data
- `GET /api/dashboard/payments` - Payment analytics
- `GET /api/dashboard/reports` - Maintenance report statistics

## Error Handling

- Loading states with spinner animations
- Error boundaries with retry functionality
- Graceful fallbacks to default values
- User-friendly error messages