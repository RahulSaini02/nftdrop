import Head from 'next/head'
import type { GetServerSideProps } from 'next'
import { sanityClient } from '../sanity'
import { Collection } from '../typings'
import Header from '../components/Header';
import NFTCard from '../components/NFTCard';


interface Props {
  collections: Collection[]
}


const Home = ({ collections }: Props) => {

  return (
    <div className="max-w-7xl mx-auto flex flex-col min-h-screen py-8 px-10 2xl:px-0">
      <Head>
        <title>NFT Drop</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
      </Head>
      <Header />
      <main className='bg-slate-100 rounded-xl p-10 shadow-xl shadow-rose-400/20'>
        <div className='grid space-x-3 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'>
          {
            collections.map(collection => (
                <NFTCard collection={collection} />
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
