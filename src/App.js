import { Outlet } from 'react-router';
import './style/App.css';
import HeaderTitle from './components/title';
import Navigation from './components/navigation'
import { useFirebaseAuth } from './firebase/firebase-auth';
import MeasureTypeProvider from './context/measure_type';
import UserMeasurementsProvider from './context/user_measurements';

function App() {
  const { user } = useFirebaseAuth()

  return (
    <div className="App relative">
    <div className="flex flex-row w-screen justify-between fixed top-0 z-10 bg-body-met-bg">
      <HeaderTitle />
       {user && <Navigation />}
    </div>
    <div className='-z-1 py-10 w-[90vw] mx-auto'>
    <MeasureTypeProvider>
    <UserMeasurementsProvider>
        <Outlet />
    </UserMeasurementsProvider>
    </MeasureTypeProvider>
    </div>
     
    </div>
  );
}

export default App;
