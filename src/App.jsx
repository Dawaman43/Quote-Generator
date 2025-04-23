import React, { useState } from 'react'
import quote from './quotes.json'

function App() {
  const [randomizeSet, setRandomizeSet] = useState(null);

  const handleRandomize=()=>{
    const randomIndex = Math.floor(Math.random() * quote.quotes.length);
    const randomSet = quote.quotes[randomIndex];

    setRandomizeSet(randomSet);
  }

  return (
    <div className='flex justify-center items-center flex-col my-65'>
      
       { randomizeSet && (
          <ul className='bg-gray-200 w-5/6 h-98 overflow-scroll p-4 relative'>
            <li className='text-2xl'>
              <span className='text-center'>
                "{randomizeSet.quote}" 
              </span>
              <br />
              <br />
              <span className='text-4xl font-bold text-indigo-500 absolute bottom-0'>
                {randomizeSet.author}
              </span>
            </li>
          </ul>
        )
      }

      {!randomizeSet && (
        <div className='text-2xl '>click the button to generate quote</div>
      )}

      <button onClick={handleRandomize} className='text-3xl bg-green-300 text-white p-4 rounded-2xl font-bold  cursor-pointer my-5'>Randomize</button>
    </div>
  )
}

export default App