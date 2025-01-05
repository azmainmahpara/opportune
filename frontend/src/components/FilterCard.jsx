import React, { useEffect, useState } from 'react'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Label } from './ui/label'
import { useDispatch } from 'react-redux'
import { setSearchedQuery } from '@/redux/jobSlice'

const fitlerData = [
    {
        fitlerType: "Location",
        array: ["Johor", "Selangor", "Penang", "Melaka"]
    },
    {
        fitlerType: "Industry",
        array: ["Tech", "Business", "Healthcare", "IT", "Software"]
    },

]

const FilterCard = () => {
    const [selectedValue, setSelectedValue] = useState('');
    const dispatch = useDispatch();
    const changeHandler = (value) => {
        setSelectedValue(value);
    }
    useEffect(()=>{
        dispatch(setSearchedQuery(selectedValue));
    },[selectedValue]);
    return (
        <div className="w-full bg-white p-5 rounded-md shadow-md">
          <h1 className="font-bold text-xl text-gray-800 mb-4">Filter Jobs</h1>
          <hr className="border-gray-300 mb-4" />
          <div className="flex gap-6">
            {fitlerData.map((data, index) => (
              <div key={index} className="relative group">
                <button className="font-semibold text-gray-700 hover:text-gray-900 px-4 py-2 bg-gray-100 rounded-md border border-gray-300">
                  {data.fitlerType}
                </button>
                {/* Dropdown Menu */}
                <div className="absolute left-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg hidden group-hover:block z-10">
                  <RadioGroup value={selectedValue} onValueChange={changeHandler} className="p-3">
                    {data.array.map((item, idx) => {
                      const itemId = `id${index}-${idx}`;
                      return (
                        <div
                          key={itemId}
                          className="flex items-center px-4 py-2 hover:bg-gray-100"
                        >
                          <RadioGroupItem value={item} id={itemId} />
                          <Label htmlFor={itemId} className="ml-2 text-gray-600">
                            {item}
                          </Label>
                        </div>
                      );
                    })}
                  </RadioGroup>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
      
      
}

export default FilterCard