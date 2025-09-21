import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'

const App = () => {
  return (
    <div className='bg-base-200'>

      <Navbar />
      <div className='flex '>
        <Sidebar/>
        <div className='p-8'>

        <Outlet />
        </div>
      </div>
    </div>
  )
}

export default App
