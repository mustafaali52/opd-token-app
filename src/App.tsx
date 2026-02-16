import { useState } from 'react'
import './App.css'
import DoctorList from './components/DoctorList'

function App() {
  return (
    <div>
      <h1>OPD Token Generation App</h1>
      <DoctorList />
    </div>
  )
}

export default App
