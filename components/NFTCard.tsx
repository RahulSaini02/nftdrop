import Link from 'next/link'
import React from 'react'
import { urlFor } from '../sanity'
import { Collection } from '../typings'

interface Props {
  collection: Collection
}

function NFTCard({collection}:Props) {
  return (
    <Link href={`/nft/${collection.slug.current}`}>
        <div key={ collection._id} className='flex flex-col items-center cursor-pointer transition-all duration-200 hover:scale-105'>
            <img className='h-96 w-60 rounded-2xl object-cover' src={urlFor(collection.mainImage).url()} alt="" />
            <div className='p-5'>
            <h2 className='text-3xl'>{collection.title}</h2>
            <p className='mt-2 text-sm text-gray-400'>{collection.description}</p>
            </div>
        </div>
    </Link>
  )
}

export default NFTCard