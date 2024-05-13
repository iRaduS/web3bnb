import { HomeModernIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import { Fragment } from 'react';

import AuthenticationButton from './AuthenticationButton';
import { useAccountStore } from '../store/store';

const Navigation = ({ routes }) => {
  const { address } = useAccountStore();

  return (
    <div className="py-3">
      <div className="grid grid-cols-3 gap-4 bg-white py-5 px-2 mx-5 shadow-sm rounded-lg">

        <div className="px-5 flex">
          <Link to="/">
            <div className="flex shadow-md justify-center items-center bg-red-500 rounded-full py-2 px-2">
              <HomeModernIcon className="h-6 w-6 text-white" />
            </div>
          </Link>
        </div>

        <div className="flex justify-center items-center">
          {routes.map((route, index) => (<Fragment key={index}>{ (route.private && address) && (
            <Link to={route.path}>
          <div className="mx-3 text-gray-700 decoration-red-500 decoration-4 underline font-semibold uppercase">
            {route.name}
          </div>
        </Link>
            )}</Fragment>))}
        </div>

        <div className="px-5 flex justify-end">
          <AuthenticationButton/>
        </div>
      </div>
    </div>
  );
}

export default Navigation;