import { useState } from 'react';
import { useAccommodationStore } from '../store/store';


const AddAccommodation = () => {
  const [address, setAddress] = useState({ name: '', location: '', price: '', image: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { addDataToIPFS, unpinDataToIPFS, createNewAccommodation } = useAccommodationStore();


  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccess(false);
    setLoading(true);

    const ipfsUploadingResult = await addDataToIPFS(address);
    createNewAccommodation(`${process.env.REACT_APP_PINATA_GATEWAY}/ipfs/${ipfsUploadingResult.IpfsHash}`, address.price)
      .then(() => {
        setLoading(false)
        setAddress({ name: '', location: '', price: '', image: '', description: '' })
        setSuccess(true)
      })
      .catch(async (err) => {
        console.log(err);

        await unpinDataToIPFS(ipfsUploadingResult.IpfsHash);
        setLoading(false);
      })
  }

  return (
    <div className="flex justify-center">
      <div className="bg-white shadow-md rounded-lg px-5 py-5 min-w-[50%]">
        { success &&
        <div className="flex flex-col justify-between bg-green-300 text-center font-semibold text-green-700 shadow-md rounded-lg px-5 py-5 min-w-[25%]">
          The accommodation was successfully created!

          <button onClick={() => setSuccess(false)} className="mt-2 bg-green-500 px-2 py-1 text-green-900 shadow-md rounded-lg">Dismiss</button>
        </div>
        }
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col my-5">
            <label htmlFor="name" className="font-semibold text-gray-900 text-sm">
              Name of the accommodation
              <span className="text-red-500 ml-1 text-sm">(required)</span>
            </label>
            <input
              required
              className="px-2 py-2 bg-gray-100 rounded-lg mt-1 ring-0 focus:border-none focus:shadow-none"
              id="name"
              type="text"
              placeholder="Enter here the accommodation name."
              value={address.name}
              onChange={(e) => setAddress({...address, name: e.target.value})}
            />
          </div>
          <div className="flex flex-col my-5">
            <label htmlFor="location" className="font-semibold text-gray-900 text-sm">
              Location (City, Country)
              <span className="text-red-500 ml-1 text-sm">(required)</span>
            </label>
            <input
              required
              className="px-2 py-2 bg-gray-100 rounded-lg mt-1 ring-0 focus:border-none focus:shadow-none"
              id="location"
              type="text"
              placeholder="Enter here the accommodation location."
              value={address.location}
              onChange={(e) => setAddress({...address, location: e.target.value})}
            />
          </div>
          <div className="flex flex-col my-5">
            <label htmlFor="rooms" className="font-semibold text-gray-900 text-sm">
              Price per night
              <span className="text-red-500 ml-1 text-sm">(required)</span>
            </label>
            <input
              required
              className="px-2 py-2 bg-gray-100 rounded-lg mt-1 ring-0 focus:border-none focus:shadow-none"
              id="rooms"
              type="number"
              placeholder="Enter here the accommodation price per night."
              value={address.price}
              onChange={(e) => setAddress({...address, price: e.target.value})}
            />
          </div>
          <div className="flex flex-col my-5">
            <label htmlFor="image" className="font-semibold text-gray-900 text-sm">
              Image URL
              <span className="text-red-500 ml-1 text-sm">(required)</span>
            </label>
            <input
              required
              className="px-2 py-2 bg-gray-100 rounded-lg mt-1 ring-0 focus:border-none focus:shadow-none"
              id="image"
              type="text"
              placeholder="Enter here the image url."
              value={address.image}
              onChange={(e) => setAddress({...address, image: e.target.value})}
            />
          </div>
          <div className="flex flex-col my-5">
            <label htmlFor="image" className="font-semibold text-gray-900 text-sm">
              Description
              <span className="text-red-500 ml-1 text-sm">(required)</span>
            </label>
            <textarea
              required
              className="px-2 py-2 bg-gray-100 rounded-lg mt-1 ring-0 focus:border-none focus:shadow-none"
              id="image"
              placeholder="Enter here the description."
              value={address.description}
              onChange={(e) => setAddress({...address, description: e.target.value})}
            />
          </div>
          <button disabled={loading}
                  className="px-2 py-2 bg-red-500 rounded-full shadow-md min-w-full text-white font-semibold"
                  type="submit">Submit new accommodation
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddAccommodation;