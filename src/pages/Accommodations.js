import { Fragment, useEffect, useState } from 'react';
import { Description, Dialog, DialogPanel, DialogTitle } from '@headlessui/react';

import { useAccommodationStore } from '../store/store';
import { MapPinIcon } from "@heroicons/react/24/solid";
import { CubeTransparentIcon } from "@heroicons/react/24/solid";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { XCircleIcon } from "@heroicons/react/24/solid";

const Accommodations = () => {
  const { fetchAccommodations, ownerAccommodations, updateListingStatus, updateListingPrice } = useAccommodationStore()
  const [show, setShow] = useState(false);
  const [disable, setDisable] = useState(false);
  const [proposedPrice, setProposedPrice] = useState(null);

  useEffect(() => {
    fetchAccommodations()
      .catch(console.error)
  }, [fetchAccommodations])

  const changeListingStatus = async (tokenId, status) => {
    setDisable(true);
    // eslint-disable-next-line no-undef
    await updateListingStatus(tokenId, status);
    setDisable(false);
  }

  const updatePrice = async (tokenId) => {
    if (proposedPrice === null) {
      return false;
    }

    setDisable(true);
    await updateListingPrice(tokenId, proposedPrice);
    setDisable(false);
  }

  return (
    <div className="flex justify-center">
      <div className="bg-white shadow-md rounded-lg px-5 py-5 min-w-[50%]">
        {
          ownerAccommodations.length === 0 ? (
            <div className="font-semibold text-center">
              No accommodations were found.
            </div>
          ) : (
            <>
              { ownerAccommodations.map((accommodation, index) => (
                <div className="my-3" key={index}>
                  <div className="flex flex-row justify-center px-5 py-5 min-w-[90%] bg-gray-100 shadow-md rounded-lg">
                    {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                    <img className="object-cover h-32 w-96 rounded-md" src={accommodation.tokenData.image}  alt="Photo"/>

                    <div className="ml-3 min-w-fit">
                      <h2 className="text-xl text-gray-900 font-semibold">{accommodation.tokenData.name}</h2>
                      <small className="text-gray-500 text-sm">{accommodation.tokenData.description}</small>
                      <div className="flex items-center">
                        <MapPinIcon className="h-3 w-3"></MapPinIcon>
                        <small className="ml-1 text-gray-700 text-sm">{accommodation.tokenData.location}</small>

                        <CubeTransparentIcon onClick={() => setShow(true)} className="ml-5 h-3 w-3"></CubeTransparentIcon>
                        <small className="ml-1 text-gray-700 text-sm font-semibold">{accommodation.pricePerNight} ETH/night</small>

                        <>
                        {
                          !accommodation.currentlyListed ? (
                            <>
                              <CheckCircleIcon className="text-green-500 ml-5 h-3 w-3"></CheckCircleIcon>
                              <small className="ml-1 text-green-700 text-sm font-semibold">Listed</small>
                            </>
                          ) : (
                            <>
                              <XCircleIcon className="text-red-500 ml-5 h-3 w-3"></XCircleIcon>
                              <small className="ml-1 text-red-700 text-sm font-semibold">Hidden</small>
                            </>
                          )
                        }
                        </>
                      </div>
                    </div>

                    <div className="flex items-end">
                      <button onClick={() => { changeListingStatus(accommodation.tokenId, !accommodation.currentlyListed) }}
                              disabled={disable}
                              className="ml-2 bg-indigo-500 px-2 py-2 text-gray-100 shadow-md rounded-lg">Change listing status
                      </button>
                      <button onClick={() => { updatePrice(accommodation.tokenId) }}
                              disabled={disable}
                              className="ml-2 bg-gray-700 px-2 py-2 text-gray-100 shadow-md rounded-lg">Update price
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )
        }
        <Dialog open={show} onClose={() => setShow(false)} className="relative z-50">
          <div className="fixed inset-0 flex w-screen bg-[#000000AA] items-center justify-center p-4">
            <DialogPanel className="max-w-lg space-y-4 rounded-lg bg-white shadow-md p-12">
              <DialogTitle className="font-bold">Set a new price</DialogTitle>
              <Description>This will set a new price per night for the current accommodation.</Description>
              <input
                required
                className="px-2 py-2 bg-gray-100 rounded-lg min-w-full mt-1 ring-0 focus:border-none focus:shadow-none"
                id="rooms"
                type="number"
                placeholder="Enter here the accommodation price per night."
                value={proposedPrice}
                onChange={(e) => setProposedPrice(e.target.value)}
              />
              <div className="flex gap-4">
                <button className="bg-indigo-500 text-white px-2 py-2 rounded-lg shadow-md" onClick={() => setShow(false)}>Set new price</button>
              </div>
            </DialogPanel>
          </div>
        </Dialog>
      </div>
    </div>
  );
}

export default Accommodations;