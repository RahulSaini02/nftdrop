import Link from 'next/link'
import React from 'react'
import { useAddress, useDisconnect, useMetamask } from "@thirdweb-dev/react";

function Header() {

    const connectWithMetaMask = useMetamask()
    const address = useAddress()
    const disconnect = useDisconnect()
  return (
    <div className='mb-5'>
        <header className='flex justify-between items-center p-2'>
            <Link href='/'>
                <h1 className='w-52 cursor-pointer text-xl font-extralight sm:w-80'>The <span className='font-extrabold underline decoration-pink-600/50'>PAPAFAM</span> NFT Market Place</h1>
            </Link>
            <div>
                {address ? (
                <button className='px-4 py-2 bg-gray-400 rounded-full text-white text-xs font-bold lg:px-5 lg:py-3 lg:text-base' onClick={() => disconnect()}>
                Sign Out
                </button>
                ): (
                    <button className='px-4 py-2 bg-rose-400 rounded-full text-white text-xs font-bold lg:px-5 lg:py-3 lg:text-base' onClick={() => connectWithMetaMask()}>
                    Sign In
                </button>
                )}                
            </div>
        </header>
        <hr className='border my-2' />
    </div>
  )
}

export default Header