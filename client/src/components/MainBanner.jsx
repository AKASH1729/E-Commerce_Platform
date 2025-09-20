import React from 'react'
import { assets } from '../assets/assets'
import { Link } from 'react-router-dom'

const MainBanner = () => {
  return (
    <div className="relative text-center flex flex-col items-center justify-center py-10">
      {/* Desktop Banner */}
      <img 
        src={assets.main_banner_bg} 
        alt="banner" 
        className="w-full hidden md:block object-cover"
      />

      {/* Mobile Banner */}
      <img 
        src={assets.main_banner_bg_sm} 
        alt="banner" 
        className="w-full block md:hidden object-cover"
      />

      {/* Text */}
      <div className="absolute top-1/3 w-full flex flex-col items-center px-4">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-800 max-w-2xl">
          Freshness You Can Trust, Savings You Will Love!
        </h1>

        <Link 
          to={"/products"} 
          className="mt-6 group flex items-center gap-2 px-7 md:px-9 py-3 bg-primary hover:bg-primary-dull transition rounded text-white cursor-pointer"
        >
          Shop Now
          <img 
            className="md:hidden transition group-hover:translate-x-1" 
            src={assets.white_arrow_icon} 
            alt="arrow" 
          />
        </Link>
        <Link 
          to={"/products"} 
          className="group hidden md:flex items-center gap-2 px-9  py-3 cursor-pointer">
          Explore deals
          <img 
            className= "transition group-hover:translate-x-1" 
            src={assets.black_arrow_icon} 
            alt="arrow" 
          />
        </Link>
      </div>
    </div>
  )
}

export default MainBanner
