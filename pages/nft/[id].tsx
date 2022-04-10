import React, { useEffect } from 'react'
import { useAddress, useDisconnect, useMetamask } from "@thirdweb-dev/react";
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import { sanityClient, urlFor } from '../../sanity';
import { Collection } from '../../typings';

interface Props {
  collection: Collection
}

function NFTDrop({collection}: Props) {

  // Auth
  const connectWithMetaMask = useMetamask()
  const address = useAddress()
  const disconnect = useDisconnect()

  return (
    <div className='flex h-screen flex-col lg:grid lg:grid-cols-10'>
        <div className='bg-gradient-to-br from-cyan-800 to-rose-500 lg:col-span-4'>
            <div className='flex flex-col justify-center items-center py-2 lg:min-h-screen'>
                <div className='bg-gradient-to-br from-yellow-400 to-purple-600 p-2 rounded-xl'>
                    <img className='w-44 rounded-xl object-cover lg:h-96 lg:w-72' src={urlFor(collection.previewImage).url()} alt="nft image" />
                </div>
                <div className='p-5 space-y-2 text-center'>
                <h1 className='text-4xl text-white font-bold'>{collection.nftCollection}</h1>
            <h2 className='text-xl text-gray-300'>{ collection.description}</h2>
                </div>
            </div>
        </div>
        <div className='flex flex-1 flex-col p-12 lg:col-span-6'>
        {/* Header */}
        <Link href='/'>
            <header className=' flex justify-between items-center p-2'>
                <h1 className='w-52 cursor-pointer text-xl font-extralight sm:w-80'>The <span className='font-extrabold underline decoration-pink-600/50'>PAPAFAM</span> NFT Market Place</h1>
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
          </Link>
            <hr className='border my-2' />
              
              {address && (
                  <p className='text-center text-sm text-rose-400'>You are logged in with wallet {address.substring(0, 5)}...{address.substring(address.length - 5)}</p>
              ) }
            {/* Context */ }
            <div className='mt-10 flex flex-1 flex-col items-center space-y-6 text-center lg:space-y-0 lg:justify-center'>
                <img className='w-80 object-cover pb-10 lg:h-40 cursor-pointer' src={urlFor(collection.mainImage).url()}  alt="Cover" />
                <h1 className='text-3xl font-bold lg:text-5xl lg:text-extrabold'>{collection.title}</h1>
                <p className='pt-2 text-xl text-green-500'>13 / 21 NFT's claimed</p>
            </div>  
            {/* Mint Btn */ }
            <button className='mt-10 h-16 w-ful bg-red-500 text-white rounded-full font-bold'>Mint NFT (0.01 ETH)</button>
        </div >
    </div>
  )
}

export default NFTDrop

export const getServerSideProps: GetServerSideProps =async ({params}) => {
  const query = `*[_type == "collection" && slug.current == $id][0]{
    _id,
    title,
    address,
    description,
    nftCollection,
    mainImage {
       asset 
    },
    previewImage {
      asset
    },
    slug{
      current,
    },
    creator -> {
       _id,
       name,
       address,
       slug {
         current
       },
    },
  }`

  const collection = await sanityClient.fetch(query, {
    id: params?.id
  })

  if (!collection) {
    return {
      notFound: true
    }
  }

  return {
    props: {
      collection
    }
  }
}