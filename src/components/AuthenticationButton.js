import {useEffect, useState} from 'react';

import {useAccountStore} from "../store/store";

const AuthenticationButton = () => {
  const { address, connectToWeb3Provider, getAddressSliced, getAccountBalance, logoutAccount } = useAccountStore();
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(null);

  const authenticateButtonAction = async () => {
    setLoading(true);
    await connectToWeb3Provider();
    setLoading(false);
  }

  useEffect(() => {
    const fetchAccountBalance = async () => {
      const balance = await getAccountBalance();

      setBalance(balance);
    }

    if (address !== null) {
      fetchAccountBalance()
        .catch(console.error)
    }
  }, [address, getAccountBalance]);

  return (
    <>
      {address === null ? (
        <button
          onClick={authenticateButtonAction}
          className={`font-semibold transition flex justify-center items-center px-2 py-1 rounded-full bg-gray-100 text-gray-700 shadow-md hover:shadow-lg duration-200`}
          disabled={loading}
        >
          Connect to wallet
        </button>
      ) : (
        <div className="flex">
          <button onClick={logoutAccount} className="font-semibold transition flex justify-center items-center px-2 py-1 rounded-full bg-gray-100 text-gray-700 shadow-md hover:shadow-lg duration-200">
            Logout from {getAddressSliced()}
          </button>
          { balance !== null && (
            <span className="shadow-md text-sm ml-2 font-bold flex justify-center items-center bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
              {balance} ETH
            </span>
          )}
        </div>
      )}
    </>
  );
}

export default AuthenticationButton;