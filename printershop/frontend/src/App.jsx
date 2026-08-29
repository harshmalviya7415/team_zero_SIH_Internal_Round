import { useState } from "react";
import RegisterForm from "./components/PrinterRegistration.jsx";
import LoginPage from "./components/PrinterLoginPage.jsx"; 
import PrinterDashboard from "./components/PrinterDashboard.jsx";

function App() {
  // Set to 'true' to show Login first, or 'false' to show Register first
  const [showLogin, setShowLogin] = useState(true);

  // This function flips the state back and forth
  const toggleView = () => {
    setShowLogin(!showLogin);
  };

  return (
    <main>
      {/* Conditionally render based on the showLogin state */}
      {showLogin ? (
        <LoginPage onSwitch={toggleView} />
      ) : (
        <RegisterForm onSwitch={toggleView} />
      )}
      <PrinterDashboard/>
    </main>
  );
}

export default App;