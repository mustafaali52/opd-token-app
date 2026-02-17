# OPD Token Generation System

## Burhani Guards Pakistan

A comprehensive OPD (Outpatient Department) Token Generation and Management System built with React, TypeScript, and Firebase.

## Version 1.0.0

## Features

### Doctor Management
- Add new doctors with name, phone number (optional), and specialization
- View all doctors in a searchable, sortable table
- Persistent storage in Firebase Firestore

### Patient Management
- Add patients with ITS#, name, age, gender, and mohallah
- Automatic token generation (resets daily per doctor)
- Print professional branded tokens
- View all patient records with filtering options

### Token System
- Daily token numbering system (starts from 1 each day)
- Separate token sequences for each doctor
- Print tokens with organization branding
- Reprint capability for historical tokens

### Patient Records
- Comprehensive patient list with search by ITS#
- Date-based filtering
- View patient history with doctor and token information
- Export and reprint functionality

## Technology Stack

- **Frontend**: React 19.2.0 + TypeScript
- **UI Framework**: PrimeReact 10.9.7
- **Backend**: Firebase 12.9.0 (Firestore)
- **Build Tool**: Vite
- **Styling**: CSS with PrimeReact theme

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- Firebase account and project

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Firebase:
   - Update `src/config/firebase.ts` with your Firebase credentials
   - Set up Firestore security rules (see `firestore.rules`)

4. Run development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

## Firebase Setup

Refer to `FIREBASE_SETUP.md` for detailed Firebase configuration instructions.

## Project Structure

```
src/
├── components/       # React components
│   ├── DoctorList.tsx
│   ├── AddDoctorModal.tsx
│   └── PatientList.tsx
├── models/          # TypeScript interfaces
│   ├── Doctor.ts
│   └── Patient.ts
├── services/        # Business logic and API calls
│   ├── dbService.ts
│   ├── doctorService.ts
│   └── patientService.ts
├── config/          # Configuration files
│   └── firebase.ts
└── App.tsx         # Main application component
```

## Copyright

© 2026 Master Mind Solutions. All Rights Reserved.

## License

This project is proprietary software developed for Burhani Guards Pakistan Div III.

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
