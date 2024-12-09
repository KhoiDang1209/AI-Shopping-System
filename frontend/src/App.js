import './App.css';
import HomePage from './Pages/HomePage/HomePage';
import SignUp from './Pages/SignUpPage/SignUp';
import { Routes, Route } from 'react-router-dom';
import Product from './Pages/ProductPage/Product';
import SearchResult from "./Pages/SearchResult/SearchResult"
import Item from "./Pages/ItemPage/Item";
import Cart from './Pages/CartPage/Cart';
import SignIn from "./Pages/SignIn/SignIn";
import Checkout from './Pages/CheckoutPage/Checkout';
import SignUpVerify from './Pages/SignUpPage/signUpVerify';
import ForgetPassword from './Pages/ForgetPassword/ForgetPassword';
import FPVerify from './Pages/ForgetPassword/FPVerify';
import ChangePassword from './Pages/ForgetPassword/ChangePassword';
import LoginVerify from './Pages/SignIn/LoginVerify';
import { BrowserRouter as Router } from 'react-router-dom';
import CategoryPage from './Pages/CategoryPage/CategoryPage';
import UserPage from './Pages/UserPage/UserPage';
import ChangeUserInfo from './Pages/UserPage/ChangeUserInfo';
function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/Product' element={<Product />} />
        <Route path='/SignUp' element={<SignUp />} />
        <Route path='/SignIn' element={<SignIn />} />
        <Route path='/search' element={<SearchResult />} />
        <Route path='/Item/:product_id' element={<Item />} />
        <Route path='/Cart' element={<Cart />} />
        <Route path='/Checkout' element={<Checkout />} />
        <Route path='/signUpVerify' element={<SignUpVerify />} />
        <Route path='/ForgetPassword' element={<ForgetPassword />} />
        <Route path='/FPVerify' element={<FPVerify />} />
        <Route path='/ChangePassword' element={<ChangePassword />} />
        <Route path='/LoginVerifyEmail' element={<LoginVerify />} />
        <Route path="/Homepage/:category" element={<CategoryPage />} />
        <Route path="/UserPage" element={<UserPage />} />
        <Route path="/ChangeUserInfo" element={<ChangeUserInfo />} />
      </Routes>
    </div>
  );
}

export default App;
