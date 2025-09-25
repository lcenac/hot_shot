import logo from './logo.svg';
import './App.css';
import './mainPage.css';
import './PlayerList.css';
import MainPage from './mainPage.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PlayerList from "./PlayerList.js";
import PlayerDetail from "./PlayerDetail.js";

function App() {
   return (
    <><MainPage /><><Router>
       <Routes>
         {/* Home or list of players */}
         <Route path="/" element={<PlayerList />} />

         {/* Dynamic route for individual players */}
         <Route path="/player/:id" element={<PlayerDetail />} />
       </Routes>
     </Router></></>
  );


}

export default App;
