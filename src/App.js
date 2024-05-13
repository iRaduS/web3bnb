import { Fragment } from 'react';
import {BrowserRouter, Route, Redirect, Switch} from 'react-router-dom';

import { useAccountStore } from './store/store';
import Navigation from './components/Navigation';
import Main from './pages/Main';
import AddAccommodation from './pages/AddAccommodation';
import Accommodations from './pages/Accommodations';
import Bookings from './pages/Bookings';

const PrivateRoute = ({ component: Component, ...rest }) => {
  const { address } = useAccountStore();

  return (
    <Route {...rest} render={(props) => (
      address !== null ? <Component {...props} />
        : <Redirect  to={{ pathname: "/", state: { from: props.location } }} />
    )} />
  );
}

const routes = [
  { path: '/add-accommodation', component: AddAccommodation, private: true, navlink: true, name: 'Add new accommodation' },
  { path: '/accommodations', component: Accommodations, private: true, navlink: true, name: 'My accommodations' },
  { path: '/bookings', component: Bookings, private: true, navlink: true, name: 'My bookings' },
  { path: '/', component: Main, private: false, navlink: false, name: 'Home' },
]

const navigationRoutes = routes
  .filter((route) => route.navlink)
  .map((route) => ({ path: route.path, name: route.name, private: route.private }));

const App = () => (
  <BrowserRouter>
    <div className="bg-gray-100 min-h-screen min-w-full">
      <Navigation routes={navigationRoutes} />

      <div className="min-h-screen flex flex-col px-5 py-5 justify-center">
          <Switch>
            <Fragment>
            {routes.map((route, index) => (
              <Fragment key={index}>
                {!route.private ? (
                  <Route exact path={route.path} component={route.component} />
                ) : (
                  <PrivateRoute exact path={route.path} component={route.component} />
                )}
              </Fragment>
            ))}
            </Fragment>
          </Switch>
      </div>

    </div>
  </BrowserRouter>
)

export default App;
