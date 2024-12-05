import { ADD_TO_CART,REMOVE_FROM_CART,UPDATE_CART_QUANTITY,CLEAR_CART, REMOVE_ALL_FROM_CART } from "../ActionType";

// Call for initial value for item ( as arr )
const initialState = {
    items: []
  };

//Function for reduce
const CartReducer = (state = initialState, action)=>{
    switch (action.type) {
        //Add to cart (+)
        case ADD_TO_CART:
          return {
            ...state,
            items: [...state.items, action.payload]
          };
        //Remove from cart (-)
        case REMOVE_FROM_CART:
          return {
            ...state,
            items: state.items.filter(item => item.id !== action.payload)
          };
        //Update cart number
        case UPDATE_CART_QUANTITY:
          return {
            ...state,
            items: state.items.map(item =>
              item.id === action.payload.itemId ? { ...item, quantity: action.payload.quantity } : item
            )
          };
        //Remove all from cart
        case CLEAR_CART:
          return {
            ...state,
            items: []
          };

        // Handle the remove all action
        case REMOVE_ALL_FROM_CART:
          return {
            ...state,
            items: []
          };
        default:
          return state;
      }
}

export default CartReducer;