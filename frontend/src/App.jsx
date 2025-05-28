import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import EmployeeProfileForm from './components/EmployeeProfileForm';
import EmployeeList from './components/EmployeeList';
import GalleryPreview from './components/GalleryPreview';

function App() {
  return (
    <Router>
      <div className="items-center">

        <Routes>
          <Route path="/" element={<EmployeeProfileForm />} />
          <Route path="/employees" element={<EmployeeList />} />
          <Route path="/add-employee" element={<EmployeeProfileForm />} />
          <Route path="/edit-employee/:id" element={<EmployeeProfileForm />} />
          <Route path="/gallery/:id" element={<GalleryPreview />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
