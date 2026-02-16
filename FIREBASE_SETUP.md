# Firebase Setup Guide

## Prerequisites
- A Firebase account
- A Firebase project

## Setup Steps

### 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard

### 2. Enable Firestore Database
1. In your Firebase project, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development) or "Start in production mode"
4. Select a location for your database

### 3. Get Firebase Configuration
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click on the web icon (</>) to add a web app
4. Register your app with a nickname
5. Copy the `firebaseConfig` object

### 4. Update Configuration File
1. Open `src/config/firebase.ts`
2. Replace the placeholder values with your actual Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 5. Configure Firestore Security Rules
In the Firebase Console, go to Firestore Database > Rules and update:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access for development
    // TODO: Update these rules for production
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Important**: Update these rules for production to secure your database!

## Database Service Usage

### Import the service
```typescript
import { dbService } from './services/dbService';
```

### Available Methods

#### Doctors
- `addDoctor(doctor)` - Add a new doctor
- `getDoctors()` - Get all doctors
- `getDoctor(doctorId)` - Get a specific doctor
- `updateDoctor(doctorId, data)` - Update doctor information
- `deleteDoctor(doctorId)` - Delete a doctor

#### Patients
- `addPatient(patient)` - Add a new patient
- `getPatients()` - Get all patients
- `getPatientByItsNo(itsNo)` - Find patient by ITS number

#### Tokens
- `addToken(tokenData)` - Record a new token
- `getTokensByDoctor(doctorId, date?)` - Get tokens for a doctor
- `getLastTokenNumber(doctorId, date?)` - Get last token number for a doctor

### Example Usage

```typescript
// Add a doctor
const doctorId = await dbService.addDoctor({
  name: "Dr. John Doe",
  phone: "+1-555-0100",
  specialization: "Cardiology"
});

// Get all doctors
const doctors = await dbService.getDoctors();

// Add a patient
const patientId = await dbService.addPatient({
  itsNo: "12345678",
  name: "Jane Smith",
  age: 30,
  gender: "Female",
  mohallah: "Downtown"
});

// Add a token
await dbService.addToken({
  doctorId: 1,
  patientId: 1,
  tokenNumber: 5,
  doctorName: "Dr. John Doe",
  patientName: "Jane Smith",
  date: new Date()
});

// Get last token number
const lastToken = await dbService.getLastTokenNumber(1);
```

## Environment Variables (Recommended)

For better security, store Firebase credentials in environment variables:

1. Create a `.env` file in the project root:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

2. Update `src/config/firebase.ts`:
```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

3. Add `.env` to `.gitignore` to keep credentials private

## Collections Structure

### doctors
```typescript
{
  name: string;
  phone: string;
  specialization: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}
```

### patients
```typescript
{
  itsNo: string;
  name: string;
  age: number;
  gender: string;
  mohallah: string;
  createdAt: Timestamp;
}
```

### tokens
```typescript
{
  doctorId: number;
  patientId: number;
  tokenNumber: number;
  doctorName: string;
  patientName: string;
  date: Timestamp;
  createdAt: Timestamp;
}
```

## Troubleshooting

### Common Issues

1. **Firebase not initialized**: Make sure you've updated the configuration in `src/config/firebase.ts`

2. **Permission denied**: Check your Firestore security rules

3. **Network errors**: Verify your internet connection and Firebase project status

4. **Import errors**: Ensure Firebase is installed: `npm install firebase`
