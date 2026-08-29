import { useState } from 'react';
import Login from './components/UserLoginPage';
import RegisterForm from './components/userreg';
import UserDashboard from './components/UserDashboard';


function App() {
  // State to toggle between Login (true) and Register (false)
  const [isLogin, setIsLogin] = useState(true);

  const handleSwitch = () => {
    setIsLogin((prev) => !prev);
  };

  return (
    <div className="app-container">
      {isLogin ? (
        <Login onSwitch={handleSwitch} />
      ) : (
        <RegisterForm onSwitch={handleSwitch} />
      )}
      <UserDashboard/>
    </div>
  );
}

export default App;