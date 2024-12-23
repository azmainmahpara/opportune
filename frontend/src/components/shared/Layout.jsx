import { useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import ChatButton from './ChatButton';

const Layout = () => {
  const { user } = useSelector((state) => state.auth);
  
  console.log('Auth User:', user);

  return (
    <div className="relative min-h-screen">
      <Outlet />
      {user && <ChatButton userType={user.role} />}
    </div>
  );
};

export default Layout; 