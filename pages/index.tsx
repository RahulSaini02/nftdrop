import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import { useAddress, useDisconnect, useMetamask } from "@thirdweb-dev/react";
// import Image from 'next/image'

import { sanityClient, urlFor } from '../sanity'
import { Collection } from '../typings'
import Link from 'next/link';


interface Props {
  collections: Collection[]
}


const Home = ({ collections }: Props) => {
  const connectWithMetaMask = useMetamask()
  const address = useAddress()
  const disconnect = useDisconnect()

  return (
    <div className="max-w-7xl mx-auto flex flex-col min-h-screen py-20 px-10 2xl:px-0">
      <Head>
        <title>NFT Drop</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Link href='/'>
        <header className='mb-5 flex justify-between items-center p-2'>
            <h1 className='w-75 cursor-pointer text-2xl font-extralight'>The <span className='font-extrabold underline decoration-pink-600/50'>PAPAFAM</span> NFT Market Place</h1>
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
      <main className='bg-slate-100 rounded-xl p-10 shadow-xl shadow-rose-400/20'>
        <div className='grid space-x-3 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'>
          {
            collections.map(collection => (
              <Link href={`/nft/${collection.slug.current}`}>
                <div key={ collection._id} className='flex flex-col items-center cursor-pointer transition-all duration-200 hover:scale-105'>
                  <img className='h-96 w-60 rounded-2xl object-cover' src={urlFor(collection.mainImage).url()} alt="" />
                  <div className='p-5'>
                    <h2 className='text-3xl'>{collection.title}</h2>
                    <p className='mt-2 text-sm text-gray-400'>{collection.description}</p>
                  </div>
                </div>
              </Link>
            ))
          }
        </div>
      </main>
    </div>
  )
}

export default Home

export const getServerSideProps: GetServerSideProps =async () => {
  const query = `*[_type == "collection"]{
    _id,
    title,
    description,
    mainImage {
       asset 
    },
    slug{
      current,
    },
  }`

  const collections = await sanityClient.fetch(query)

  return {
    props: {
      collections,
    }
  }
}
