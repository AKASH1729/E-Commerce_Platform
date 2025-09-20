import React from 'react'
import ProductCard from './ProductCard'
import { useAppContext } from '../context/AppContext';

const BestSeller = () => {
  const { products } = useAppContext();

  return (
    <div className='mt-16'>
      <p className='text-2xl md:text-3xl font-medium'>Best Sellers</p>
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6'>
        {products
          .filter((product) => product.inStock) // ✅ only show in-stock
          .slice(0, 5)                          // ✅ take first 5
          .map((product, index) => (
            <ProductCard key={index} product={product} />
          ))}
          {/* ✅ FIX */}
      </div>
    </div>
  )
}

export default BestSeller
