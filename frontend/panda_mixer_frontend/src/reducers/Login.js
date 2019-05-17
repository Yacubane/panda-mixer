import Auth from '../functions/Auth';

const login = (state={loggedIn : Auth.isLoggedIn()}, action) => {
    switch (action.type) {
      case 'LOGGED_IN':
        return { ...state, loggedIn : true };
      case 'LOGGED_OUT':
        return { ...state, loggedIn : false  };
      default:
        return state;
      }
  };    

  export default login