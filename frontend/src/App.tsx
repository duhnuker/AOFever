import "@radix-ui/themes/styles.css";
import { Theme, Box } from '@radix-ui/themes';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from "./pages/Home";
import AOMensSingles from './pages/Mens/AOMensSingles';
import AOWomensSingles from './pages/Womens/AOWomensSingles';
import AOMensDoubles from "./pages/Mens/AOMensDoubles";
import AOWomensDoubles from "./pages/Womens/AOWomensDoubles";
import MensHeadToHead from "./pages/Mens/MensHeadToHead";
import WomensHeadToHead from "./pages/Womens/WomensHeadToHead";


function App() {

  return (
    <Theme accentColor="lime">
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home />}></Route>
          <Route path='/aomenssingles' element={<AOMensSingles />}></Route>
          <Route path='/aomensdoubles' element={<AOMensDoubles />}></Route>
          <Route path='/aowomenssingles' element={<AOWomensSingles />}></Route>
          <Route path='/aowomensdoubles' element={<AOWomensDoubles />}></Route>
          <Route path='/mensheadtohead' element={<MensHeadToHead />}></Route>
          <Route path='/womensheadtohead' element={<WomensHeadToHead />}></Route>
        </Routes>
      </BrowserRouter>
    </Theme>
  )
}

export default App
