import { Outlet } from 'react-router-dom'

function App() {

  return (
    <div className='font-poppins text-black text-[13px] 2xl:text-[15px] w-full h-screen flex flex-col items-center justify-start pt-5'>
      <Outlet />
    </div>
  )
}

export default App
