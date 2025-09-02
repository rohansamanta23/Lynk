import {Outlet} from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Login from '../pages/Auth/Login';

function AuthLayout() {
  return (
      <>
          <Navbar />
          <div className='h-[10vh]'></div>
          <Outlet />
      </>
  );
};

export default AuthLayout;