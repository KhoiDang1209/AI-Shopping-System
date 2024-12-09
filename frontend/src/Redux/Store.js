import { createStore, combineReducers } from 'redux';
import CartReducer from './Reducer/Reducer';


const rootReducer = combineReducers({
    cart: CartReducer
  });
  
  const store = createStore(rootReducer);
  
export default store;
  