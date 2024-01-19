import { Routes, Route } from "react-router-dom";
import Layout from './components/Layout';
import OpenInterest from './components/OpenInterest';

function App() {

  // const fetchData = async () => {
  //   const response = await fetch('http://localhost:8001/');
  //   const data = await response.json();
  //   console.log(data);
  // };
  
  // useEffect(() => {
  //   fetchData();
  // }, []);

  return (
    <>
      <Routes>
        <Route path="/*" element={<Layout />}>
          <Route path="*" element={<OpenInterest />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
