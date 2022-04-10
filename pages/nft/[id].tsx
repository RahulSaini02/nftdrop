import React, { useEffect, useState } from 'react'
import { GetServerSideProps } from 'next';
import { useAddress,useNFTDrop } from "@thirdweb-dev/react";
import { NFTMetadataOwner } from '@thirdweb-dev/sdk';
import { BigNumber } from 'ethers';
import toast, {Toaster} from 'react-hot-toast';
import { Dialog } from '@material-ui/core';
import Header from '../../components/Header';
import { sanityClient, urlFor } from '../../sanity';
import { Collection } from '../../typings';

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
  const [NFTClaimedData, setNFTClaimedData] = useState<NFTMetadataOwner>()
  const [NFTProperties, setNFTProperties] = useState<Array<string>>([])
  const [open, setOpen] = useState<boolean>(false)

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
  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

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
        const claimedNFT = await tx[0].data()
        
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
        setNFTClaimedData(claimedNFT)
        const properties:any = []
        const p:any = claimedNFT.metadata.properties
        for (let key of Object.keys(p)) {
          properties.push(p[key])
        }

        setNFTProperties(properties)
        handleOpen()
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
    <div className='relative flex h-screen flex-col lg:grid lg:grid-cols-10'>
      <Toaster position='bottom-right' />
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="Claimed NFT modal"
        aria-describedby="Claimed NFT"
      >
        <div className='bg-white rounded-2xl shadow-xl px-10 py-8'> 
            <h2 className='text-center text-rose-400 text-4xl text-bold mb-5'>Your's Claimed NFT</h2>
            <div className='flex flex-col items-center space-y-3'>
              <img className='h-72 w-72 lg:h-80 lg:w-80' src={NFTClaimedData?.metadata.image} alt={NFTClaimedData?.metadata.name} />
              <div>
                <p className='text-lg text-bold text-gray-700'>Name: <span className='font-light text-gray-600'>{NFTClaimedData?.metadata.name}</span></p>
                <p className='text-lg text-bold text-gray-700'>Description: <span className='font-light text-gray-600'>{NFTClaimedData?.metadata.description}</span> </p>
                <p className='text-lg text-bold text-gray-700'>Owner: <span className='font-light text-gray-600'>{NFTClaimedData?.owner.substring(0, 5)}...{NFTClaimedData?.owner.substring(NFTClaimedData?.owner.length - 5)}</span> </p>
                <p className='text-lg text-bold text-gray-700'>Properties: </p>
                <div className='flex p-3 flex-wrap space-x-2'>
                  {
                    NFTProperties?.map(property => (
                      <span className='px-4 py-2 rounded-full cursor-pointer bg-green-100 text-green-700 text-base font-bold border-2 border-green-400'>{property}</span>
                    ))
                  }
                </div>

                <button className='w-full py-2 bg-rose-500 text-white font-bold text-lg rounded-lg mt-5' onClick={handleClose}>Close</button>
              </div>
            </div>
        </div>
      </Dialog>
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
            ) : 
            claimSupply === totalSupply?.toNumber() ? (
              <>Sold Out</>
            ) : 
            !address ? (
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