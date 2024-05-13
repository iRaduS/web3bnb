import {useBookingStore} from "../store/store";
import {Fragment, useEffect, useState} from "react";
import {CheckCircleIcon, MapPinIcon, XCircleIcon} from "@heroicons/react/24/solid";

const Bookings = () => {
  const { getBookings, bookings, checkInBooking } = useBookingStore();
  const [disable, setDisable] = useState(false);

  useEffect(() => {
    getBookings()
      .catch(console.error)
  }, [getBookings]);

  const handleSubmitCheckIn = async (bookngId) => {
    setDisable(true);
    await checkInBooking(bookngId)
    setDisable(false);
  }

  return (
    <div className="flex justify-center">
      <div className="bg-white shadow-md rounded-lg px-5 py-5 min-w-[50%]">
        {
          bookings.length === 0 ? (
            <div className="font-semibold text-center">
              No bookings were found.
            </div>
          ) : (
            <>
              { bookings.map((booking, index) => (
                <div className="my-3" key={index}>
                  <div className="flex flex-row justify-center px-5 py-5 min-w-[90%] bg-gray-100 shadow-md rounded-lg">
                    {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                    <img className="object-cover h-32 w-96 rounded-md" src={booking.accommodation.tokenData.image}  alt="Photo"/>

                    <div className="ml-3 min-w-fit">
                      <h2 className="text-xl text-gray-900 font-semibold">{booking.accommodation.tokenData.name}</h2>
                      <small className="text-gray-500 text-sm">{booking.accommodation.tokenData.description}</small>
                      <div className="flex items-center">
                        <MapPinIcon className="h-3 w-3"></MapPinIcon>
                        <small className="ml-1 text-gray-700 text-sm">{booking.accommodation.tokenData.location}</small>

                        <>
                          {
                            booking.checkedIn ? (
                              <>
                                <CheckCircleIcon className="text-green-500 ml-5 h-3 w-3"></CheckCircleIcon>
                                <small className="ml-1 text-green-700 text-sm font-semibold">Checked In</small>
                              </>
                            ) : (
                              <>
                                <XCircleIcon className="text-red-500 ml-5 h-3 w-3"></XCircleIcon>
                                <small className="ml-1 text-red-700 text-sm font-semibold">Not Checked In</small>
                              </>
                            )
                          }
                        </>
                      </div>
                    </div>
                    {
                      !booking.checkedIn && (
                      <div className="flex items-end">
                        <button onClick={() => { handleSubmitCheckIn(booking.id) }}
                                disabled={disable}
                                className="ml-2 bg-indigo-500 px-2 py-2 text-gray-100 shadow-md rounded-lg">Check in
                        </button>
                      </div>
                      )
                    }
                  </div>
                </div>
              ))}
            </>
          )
        }
      </div>
    </div>
  );
}

export default Bookings;