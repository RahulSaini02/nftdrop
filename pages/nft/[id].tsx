import React, { useEffect, useState } from 'react'
import { useAddress,useNFTDrop } from "@thirdweb-dev/react";
import Link from 'next/link';
import toast, {Toaster} from 'react-hot-toast';
import { BigNumber } from 'ethers';
import { GetServerSideProps } from 'next';
import { sanityClient, urlFor } from '../../sanity';
import { Collection } from '../../typings';
import Header from '../../components/Header';

interface Props {
  collection: Collection
}

function NFTDrop({collection}: Props) {

  // Auth
  const address = useAddress()
  const nftDrop = useNFTDrop(collection.address)
  // States
  const [claimSupply, setClaimSupply] = useState<number>(0)
  const [totalSupply, setTotalSupply] = useState<BigNumber>()
  const [priceInETH, setPriceInETH] = useState<string>()
  const [loading, setLoading] = useState<boolean>(true)
  
  // Use Effect
  useEffect(() => {
    if (!nftDrop) return
    
    const fetchPrice = async () => { 
      const claimConditions = await nftDrop.claimConditions.getAll();
      setPriceInETH(claimConditions?.[0].currencyMetadata.displayValue)
    }

    fetchPrice()
  },[nftDrop])

  useEffect(() => {
    if (!nftDrop) return
    
    const fetchNFTDropData = async () => {
      setLoading(true)
      
      const claimed = await nftDrop.getAllClaimed();
      const totalNFTDops = await nftDrop.totalSupply();

      setClaimSupply(claimed.length)
      setTotalSupply(totalNFTDops)

      setLoading(false)
    }

    fetchNFTDropData()
  },[nftDrop])
  
  // Functions
  const mintNFT = () => {
    if(!address || !nftDrop) return

    const quantity = 1;

    setLoading(true)
    const notification = toast.loading('Minting...', {
      style: {
        background: 'white',
        color: 'green',
        fontWeight: 'bolder',
        fontSize: '1rem',
        padding: '20px'
      }
      
    })
    nftDrop?.claimTo(address, quantity).then(
      async (tx) => {
        const receipt = tx[0].receipt
        const claimedTokenId = tx[0].id
        const claimedNFT = tx[0].data()
        
        toast('You Successfully Minted!', {
          duration: 8000,
          style: {
            background: 'green',
            color: 'white',
            fontWeight: 'bolder',
            fontSize: '1rem',
            padding: '20px'
          }
        })

        console.log(receipt)
        console.log(claimedTokenId)
        console.log(claimedNFT)
      }
    ).catch(error => {
      console.log(error)
      toast('Oops! Something went wrong', {
        style: {
            background: 'red',
            color: 'white',
            fontWeight: 'bolder',
            fontSize: '1rem',
            padding: '20px'
          }
      })
    }).finally(() => {
      setLoading(false)
      toast.dismiss(notification)
    })

  }
  return (
    <div className='flex h-screen flex-col lg:grid lg:grid-cols-10'>
      <Toaster position='bottom-center' />
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
        
          <Header />
              
          {address && (
              <p className='text-center text-sm text-rose-400'>You are logged in with wallet {address.substring(0, 5)}...{address.substring(address.length - 5)}</p>
          )}
        
            {/* Context */ }
            <div className='mt-10 flex flex-1 flex-col items-center space-y-6 text-center lg:space-y-0 lg:justify-center'>
                <img className='w-80 object-cover pb-10 lg:h-40 cursor-pointer' src={urlFor(collection.mainImage).url()}  alt="Cover" />
              <h1 className='text-3xl font-bold lg:text-5xl lg:text-extrabold'>{collection.title}</h1>
          {
            loading ? (
              <>
                <p className='pt-2 text-xl text-red-500 animate-pulse'>Loading Supply Count...</p>
                <img className='h-40 w-80 object-contain' src="https://cdn.hackernoon.com/images/0*4Gzjgh9Y7Gu8KEtZ.gif" alt="Loader" />
              </>
            ) : (
              <p className='pt-2 text-xl text-green-500'>{ claimSupply } / {totalSupply?.toString()} NFT's claimed</p>
            )
          }
            </div>  
            {/* Mint Btn */ }
        <button onClick ={() => mintNFT()} disabled={loading || claimSupply === totalSupply?.toNumber() || !address} className='mt-10 h-16 w-ful bg-red-500 text-white rounded-full font-bold disabled:bg-gray-400'>
          {
            loading ? (
              <>Loading...</>
            ) : claimSupply === totalSupply?.toNumber() ? (
                <>Sold Out</>
              ) : !address ? (
                  <>Sign In to Mint</>
                ) : (
                    <span>Mint NFT ({ priceInETH } ETH)</span>                    
            )
          }
          </button>
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