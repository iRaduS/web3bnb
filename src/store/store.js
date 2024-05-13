import { Web3 } from 'web3';
import { create } from 'zustand';
import { persist, createJSONStorage } from "zustand/middleware";

import ContractAddresses from '../contractdata/contractAddresses.json';
import AirbnbABI from '../contractdata/contractAirbnbABI.json';
import BookingABI from '../contractdata/contractBookingABI.json';

export const useAccountStore = create(
  persist((set, get) => ({
      address: null,
      connectToWeb3Provider: async () => {
        if (window.ethereum) {
          await window.ethereum.request({ method: 'eth_requestAccounts' });

          const web3 = new Web3(window.ethereum);
          set({ address: (await web3.eth.getAccounts())[0] });
        } else {
          alert('Please get the MetaMask wallet client extension.')
        }
      },
      getAddressSliced: (n = 6) => {
        const currentAddressInStore = get().address

        return `${currentAddressInStore.slice(0, n)}...${currentAddressInStore.slice(currentAddressInStore.length - n)}`
      },
      getAccountBalance: async () => {
        if (window.ethereum) {
          const web3 = new Web3(window.ethereum);

          const balance = await web3.eth.getBalance(get().address)
          return web3.utils.fromWei(balance, 'ether')
        } else {
          alert('Please get the MetaMask wallet client extension.')
        }
      },
      logoutAccount: () => {
        set({ address: null });
      }
    }),
    {
      name: 'account-storage',
      storage: createJSONStorage(() => sessionStorage)
    }
  )
)

export const useAccommodationStore = create(persist((set, get) => ({
      ownerAccommodations: [],
      accommodations: [],
      addDataToIPFS: async (data) => {
        const res = await fetch(
          "https://api.pinata.cloud/pinning/pinJSONToIPFS",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.REACT_APP_PINATA_JWT}`,
              'Content-Type': 'application/json'
            },
            body: `{"pinataContent":${JSON.stringify(data)},"pinataMetadata":{"name":"${data.name}.json"}}`,
          }
        );

        return await res.json();
      },
      unpinDataToIPFS: async (ipfsHash) => {
        await fetch(
          "https://api.pinata.cloud/pinning/unpin/" + ipfsHash,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${process.env.REACT_APP_PINATA_JWT}`,
            },
          }
        );
      },
      createNewAccommodation: async (tokenURI, pricePerNight) => {
        if (window.ethereum) {
          const web3 = new Web3(window.ethereum);
          const airbnbContract = new web3.eth.Contract(AirbnbABI, ContractAddresses.Airbnb, { from: useAccountStore.getState().address });

          await airbnbContract.methods.createAccomodationToken(tokenURI, pricePerNight).send({ from: useAccountStore.getState().address })
        } else {
          alert('Please get the MetaMask wallet client extension.')
        }
      },
      fetchAccommodations: async () => {
        if (window.ethereum) {
          const web3 = new Web3(window.ethereum);
          const airbnbContract = new web3.eth.Contract(AirbnbABI, ContractAddresses.Airbnb, { from: useAccountStore.getState().address });

          const results = await airbnbContract.methods.getCurrentAccomodations().call({from: useAccountStore.getState().address})
          const resultsWithTokenURIs = await Promise.all(results.filter(result => result.owner !== "0x0000000000000000000000000000000000000000").map(async (result) => ({
            pricePerNight: result.pricePerNight.toString(),
            owner: result.owner,
            tokenId: result.tokenId.toString(),
            currentlyListed: result.currentlyListed,
            tokenURI: await airbnbContract.methods.tokenURI(result.tokenId)
              .call({from: useAccountStore.getState().address})
          })))
          console.log(resultsWithTokenURIs)

          set({ ownerAccommodations: await Promise.all(resultsWithTokenURIs.map(async (result) => ({
            ...result,
            tokenData: await fetch(`${result.tokenURI}`).then(response => response.json())
          }))) })
        } else {
          alert('Please get the MetaMask wallet client extension.')
        }
      },
      updateListingStatus: async (tokenId, status) => {
        const web3 = new Web3(window.ethereum);
        const airbnbContract = new web3.eth.Contract(AirbnbABI, ContractAddresses.Airbnb, { from: useAccountStore.getState().address });
        // eslint-disable-next-line no-undef
        await airbnbContract.methods.updateCurrentlyListed(BigInt(tokenId), status).send({from: useAccountStore.getState().address})
      },
      updateListingPrice: async (tokenId, price) => {
        const web3 = new Web3(window.ethereum);
        const airbnbContract = new web3.eth.Contract(AirbnbABI, ContractAddresses.Airbnb, { from: useAccountStore.getState().address });

        // eslint-disable-next-line no-undef
        await airbnbContract.methods.updateAccomodationPrice(BigInt(tokenId), BigInt(price)).send({from: useAccountStore.getState().address})
      },
      fetchAllAccommodations: async () => {
        const web3 = new Web3(window.ethereum);
        const airbnbContract = new web3.eth.Contract(AirbnbABI, ContractAddresses.Airbnb, { from: useAccountStore.getState().address });

        const results = await airbnbContract.methods.getAccomodations().call({from: useAccountStore.getState().address})
        const resultsWithTokenURIs = await Promise.all(results.map(async (result) => ({
          pricePerNight: result.pricePerNight.toString(),
          owner: result.owner,
          tokenId: result.tokenId.toString(),
          currentlyListed: result.currentlyListed,
          tokenURI: await airbnbContract.methods.tokenURI(result.tokenId)
            .call({from: useAccountStore.getState().address})
        })))

        set({ accommodations: await Promise.all(resultsWithTokenURIs.map(async (result) => ({
            ...result,
            tokenData: await fetch(`${result.tokenURI}`).then(response => response.json())
          }))) })
      }
    }), {
      name: 'accommodation-storage',
      storage: createJSONStorage(() => sessionStorage)
    }
  )
)

export const useBookingStore = create(persist((set, get) => ({
  bookings: [],
  createNewBooking: async (tokenId, startTimestamp, endTimestamp, price) => {
    const web3 = new Web3(window.ethereum);
    const bookingContract = new web3.eth.Contract(BookingABI, ContractAddresses.Booking, { from: useAccountStore.getState().address });

    // eslint-disable-next-line no-undef
    console.log(tokenId, BigInt(startTimestamp.toString()), BigInt(endTimestamp.toString()), ((parseInt(endTimestamp) - parseInt(startTimestamp)) /  (86400 * 1000)) * parseInt(price))
    // eslint-disable-next-line no-undef
    await bookingContract.methods.createBookingToAccommodation(BigInt(tokenId), BigInt(startTimestamp.toString()), BigInt(endTimestamp.toString())).send({
      from: useAccountStore.getState().address,
      value: web3.utils.toWei(((parseInt(endTimestamp) - parseInt(startTimestamp)) / (86400 * 1000)) * parseInt(price), 'ether'),
      gas: "21000"
    })
  },
  fetchUnavailableDays: async (tokenId) => {
    const web3 = new Web3(window.ethereum);
    const bookingContract = new web3.eth.Contract(BookingABI, ContractAddresses.Booking, { from: useAccountStore.getState().address });

    // eslint-disable-next-line no-undef
    return await bookingContract.methods.getUnavailableDays(BigInt(tokenId.tokenId)).call({from: useAccountStore.getState().address})
  },
  getBookings: async () => {
    const web3 = new Web3(window.ethereum);
    const bookingContract = new web3.eth.Contract(BookingABI, ContractAddresses.Booking, { from: useAccountStore.getState().address });

    const results = await bookingContract.methods.getBookedAccommodations().call({from: useAccountStore.getState().address})
    set({
      bookings: results.map(result => ({
        id: result.id.toString(),
        checkedIn: result.checkedIn,
        tokenId: result.tokenId.toString(),
        startAccomodationTimestamp: parseInt(result.startAccomodationTimestamp.toString()),
        endAccomodationTimestamp: parseInt(result.endAccomodationTimestamp.toString()),
        accommodation: useAccommodationStore.getState().accommodations.filter(accommodation => accommodation.tokenId === result.tokenId.toString())[0]
      }))
    })
  },
  checkInBooking: async (bookingId) => {
    const web3 = new Web3(window.ethereum);
    const bookingContract = new web3.eth.Contract(BookingABI, ContractAddresses.Booking, { from: useAccountStore.getState().address });

    bookingContract.events.CheckInAccomodation()
      .on('data', (eventLog) => {
        const currentObject = get().bookings.filter(booking => booking.id === eventLog.returnValues.bookingId.toString());
        currentObject[0].checkedIn = true;

        set({
          bookings: [...get().bookings.filter(booking => booking.id !== eventLog.returnValues.bookingId.toString()), currentObject[0]]
        })
      })

    // eslint-disable-next-line no-undef
    await bookingContract.methods.checkInBookingToAccommodation(BigInt(bookingId)).send({ from: useAccountStore.getState().address })
  }
}), {
  name: 'booking-storage',
  storage: createJSONStorage(() => sessionStorage)
}))