import {Fragment, useEffect, useState} from 'react';
import {Description, Dialog, DialogPanel, DialogTitle} from "@headlessui/react";
import {CheckCircleIcon, CubeTransparentIcon, MapPinIcon, XCircleIcon} from "@heroicons/react/24/solid";

import {useAccommodationStore, useAccountStore, useBookingStore} from '../store/store';
import DateRangePicker from "@wojtekmaj/react-daterange-picker";

const Main = () => {
  const { fetchAllAccommodations, accommodations } = useAccommodationStore();
  const { fetchUnavailableDays, createNewBooking } = useBookingStore();
  const { address } = useAccountStore();
  const [show, setShow] = useState(false);
  const [unavailableDays, setUnavailableDays] = useState([]);
  const [value, onChange] = useState([new Date(), new Date()]);
  const [selectedTokenId, setSelectedTokenId] = useState(null);

  useEffect(() => {
    fetchAllAccommodations()
      .catch(console.error)
  }, [fetchAllAccommodations]);

  const handleBooking = async (tokenId) => {
    const result = await fetchUnavailableDays(tokenId);

    setUnavailableDays(result);
    setSelectedTokenId(tokenId);
    setShow(true);
  }

  const handleCreateBooking = async () => {
    const startDateTime = new Date(`${value[0].getUTCMonth() + 1}/${value[0].getUTCDay()}/${value[0].getUTCFullYear()} 23:59:59`);
    const endDateTime = new Date(`${value[1].getUTCMonth() + 1}/${value[1].getUTCDay()}/${value[1].getUTCFullYear()} 23:59:59`);
    await createNewBooking(selectedTokenId.tokenId, startDateTime.getTime(), endDateTime.getTime(), selectedTokenId.pricePerNight)

    onChange([new Date(), new Date()]);
    setShow(false);
    setSelectedTokenId(null);
  }

  return (
    <div className="min-w-full grid grid-cols-5 gap-5">
      { accommodations.length && (
          <>
            { accommodations.map((accommodation, index) => (
              <Fragment key={index}>
                { !accommodation.currentlyListed && (
                <div className="px-5 py-5 bg-gray-100 shadow-md rounded-lg">
                  {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                  <img className="object-cover h-32 w-full rounded-md" src={accommodation.tokenData.image}  alt="Photo"/>

                  <div className="ml-3 mt-2 min-w-fit">
                    <h2 className="text-xl text-gray-900 font-semibold">{accommodation.tokenData.name}</h2>
                    <small className="text-gray-500 text-sm">{accommodation.tokenData.description}</small>
                    <div className="flex items-center">
                      <MapPinIcon className="h-3 w-3"></MapPinIcon>
                      <small className="ml-1 text-gray-700 text-sm">{accommodation.tokenData.location}</small>

                      <CubeTransparentIcon className="ml-5 h-3 w-3"></CubeTransparentIcon>
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
                  { address !== null ? (
                  <button
                    className="mt-5 px-2 py-2 bg-red-500 rounded-full shadow-md min-w-full text-white font-semibold"
                    onClick={async () => { await handleBooking(accommodation) }}
                  >
                    Book this accommodation
                  </button>
                  ): (
                    <button
                      className="mt-5 px-2 py-2 bg-red-500 rounded-full shadow-md min-w-full text-white font-semibold">Login to book</button>
                  )
                  }
                </div>
                )
                }
              </Fragment>
            ))}
          </>
      )
      }

      <Dialog open={show} onClose={() => setShow(false)} className="relative z-50">
        <div className="fixed inset-0 flex w-screen bg-[#000000AA] items-center justify-center p-4">
          <DialogPanel className="max-w-lg space-y-4 rounded-lg bg-white shadow-md p-12">
            <DialogTitle className="font-bold">Book this accommodation</DialogTitle>
            <Description>Unavailable dates for this accommodation: {unavailableDays.length}</Description>
            <DateRangePicker onChange={onChange} value={value} minDate={new Date()} />
            <div>
            {
              unavailableDays.map((day, index) => (
                <div className="text-red-500 text-sm" key={index}>{new Date(parseInt(day.startAccomodationTimestamp.toString())).toLocaleString()} - {new Date(parseInt(day.endAccomodationTimestamp.toString())).toLocaleString()}</div>
              ))
            }
            </div>
            <div className="flex gap-4">
              <button className="bg-indigo-500 text-white px-2 py-2 rounded-lg shadow-md" onClick={handleCreateBooking}>Book accommodation</button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
};

export default Main;