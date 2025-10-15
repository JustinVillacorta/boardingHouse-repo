
## 📊 Entity Relationship Diagram

```mermaid
erDiagram
    USER {
        ObjectId _id PK
        String username UK "3-30 chars, unique"
        String email UK "valid email format, unique"
        String password "min 6 chars, hashed"
        String role "enum: admin, staff, tenant"
        Boolean isActive "default: true"
        Date lastLogin
        Number loginAttempts "default: 0"
        Date lockUntil
        Date createdAt
        Date updatedAt
    }

    TENANT {
        ObjectId _id PK
        ObjectId userId FK "ref: User, unique"
        String firstName "max 50 chars"
        String lastName "max 50 chars"
        String phoneNumber "valid phone format"
        Date dateOfBirth "must be past date"
        String idType "enum: passport, drivers_license, national_id, other"
        String idNumber "max 50 chars"
        Object emergencyContact "embedded"
        String roomNumber "max 10 chars"
        Date leaseStartDate
        Date leaseEndDate "must be after start"
        Number monthlyRent "min: 0"
        Number securityDeposit "min: 0"
        String tenantStatus "enum: active, inactive, pending, terminated"
        Date createdAt
        Date updatedAt
    }

    ROOM {
        ObjectId _id PK
        String roomNumber UK "max 10 chars, unique"
        String roomType "enum: single, double, triple, quad, suite, studio"
        Number capacity "1-10"
        Number monthlyRent "min: 0"
        String description "max 500 chars"
        Array amenities "array of strings"
        Number floor "min: 0"
        Number area "min: 1, square meters"
        String status "enum: available, occupied, maintenance, reserved"
        ObjectId currentTenant FK "ref: Tenant"
        Object occupancy "embedded"
        Object maintenance "embedded"
        Array rentalHistory "embedded array"
        Array photos "embedded array"
        Boolean isActive "default: true"
        Date createdAt
        Date updatedAt
    }

    PAYMENT {
        ObjectId _id PK
        ObjectId tenant FK "ref: Tenant, indexed"
        ObjectId room FK "ref: Room, indexed"
        Number amount "min: 0"
        String paymentType "enum: rent, deposit, utility, maintenance, penalty, other"
        String paymentMethod "enum: cash, bank_transfer, check, credit_card, debit_card, digital_wallet, money_order"
        Date paymentDate "required if status=paid"
        Date dueDate "required"
        String status "enum: paid, pending, overdue, indexed"
        Object periodCovered "embedded"
        String receiptNumber "unique, sparse"
        String transactionReference "indexed"
        String description "max 500 chars"
        String notes "max 1000 chars"
        ObjectId recordedBy FK "ref: User, indexed"
        Object lateFee "embedded"
        Boolean isLatePayment "default: false"
        Date createdAt
        Date updatedAt
    }

    REPORT {
        ObjectId _id PK
        ObjectId tenant FK "ref: Tenant, indexed"
        ObjectId room FK "ref: Room, indexed"
        String type "enum: maintenance, complaint, other, indexed"
        String title "max 100 chars"
        String description "max 1000 chars"
        String status "enum: pending, in-progress, resolved, rejected, indexed"
        Date submittedAt "default: now"
        Date createdAt
        Date updatedAt
    }

    NOTIFICATION {
        ObjectId _id PK
        ObjectId user_id FK "ref: User"
        String title "max 200 chars"
        String message "max 1000 chars"
        String type "enum: payment_due, report_update, system_alert, maintenance, announcement, lease_reminder, other"
        String status "enum: unread, read"
        String priority "enum: low, medium, high, urgent"
        Object metadata "mixed type"
        Date expiresAt "TTL index"
        ObjectId createdBy FK "ref: User"
        Date createdAt
        Date updatedAt
    }

asten cleaned
USER {
    ObjectId _id PK
    String username UK            // 3–30 chars, unique
    String email UK               // valid email, unique
    String password               // hashed
    String role                   // enum: admin, staff, tenant
    Boolean isActive              // default: true
    Date lastLogin
    Date createdAt
    Date updatedAt
}

TENANT {
    ObjectId _id PK
    ObjectId userId FK?           // optional link to User
    String firstName
    String lastName
    String phoneNumber
    String idType                 // enum: passport, drivers_license, national_id, other
    String idNumber
    String emergencyContactName
    String emergencyContactPhone
    String roomNumber
    Date leaseStartDate
    Date leaseEndDate
    Number monthlyRent
    String status                 // enum: active, inactive, pending, terminated
    Date createdAt
    Date updatedAt
}
ROOM {
    ObjectId _id PK
    String roomNumber UK
    String type                   // enum: single, double, studio, suite
    Number capacity
    Number monthlyRent
    String description
    Array amenities               // e.g., ["AC", "Wi-Fi", "Private Bathroom"]
    String status                 // enum: available, occupied, maintenance
    Number floor
    Boolean isActive              // default: true
    Date createdAt
    Date updatedAt
}
PAYMENT {
    ObjectId _id PK
    ObjectId tenant FK            // ref: Tenant
    ObjectId room FK              // ref: Room
    Number amount
    String type                   // enum: rent, deposit, utility, penalty
    String method                 // enum: cash, transfer, digital_wallet, other
    Date paymentDate
    Date dueDate
    String status                 // enum: paid, pending, overdue
    String receiptNumber UK
    String notes
    ObjectId recordedBy FK        // ref: User
    Date createdAt
    Date updatedAt
}
REPORT {
    ObjectId _id PK
    ObjectId tenant FK
    ObjectId room FK
    String type                   // enum: maintenance, complaint, other
    String title
    String description
    String status                 // enum: pending, in-progress, resolved
    Date createdAt
    Date updatedAt
}
NOTIFICATION {
    ObjectId _id PK
    ObjectId userId FK
    String title
    String message
    String type                   // enum: payment_due, report_update, announcement, maintenance
    String status                 // enum: unread, read
    Date createdAt
}


