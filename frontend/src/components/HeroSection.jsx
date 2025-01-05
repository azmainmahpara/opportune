import React, { useState } from 'react'
import { Button } from './ui/button'
import { Search } from 'lucide-react'
import { useDispatch } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
    const [query, setQuery] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const searchJobHandler = () => {
        dispatch(setSearchedQuery(query));
        navigate("/browse");
    }

    return (
        <div className='text-center'>

    {/* New Image Section */}
    <div className="grid grid-cols-2 gap-1 my-11 mx-auto max-w-5xl">
        <div className="flex items-center justify-center">
            <img src="/images/home1.png" alt="Employer" className="w-[90%] h-auto" />
        </div>
        <div className="flex items-center justify-center">
            <img src="/images/home2.png" alt="Candidate" className="w-[90%] h-auto" />
        </div>
    </div>

    <div className='flex flex-col gap-5 my-10'>
        <h1 className='text-5xl font-bold'>Search, Apply & <br /> Get Your <span className='text-[#2596be]'>Desired Internship</span></h1>
        <div
  className="flex w-[40%] shadow-lg border border-gray-200 pl-3 rounded-full items-center gap-4 mx-auto"
  style={{ backgroundColor: 'white' }}
>            <input
                type="text"
                placeholder='Find your internship'
                onChange={(e) => setQuery(e.target.value)}
                className='outline-none border-none w-full'
            />
            <Button onClick={searchJobHandler} className="rounded-r-full bg-[#2596be]">
                <Search className='h-5 w-5' />
            </Button>
        </div>
    </div>


</div>

    
    )
}

export default HeroSection
