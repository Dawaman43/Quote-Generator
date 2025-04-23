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
    <div>
      
       { randomizeSet && (
          <ul>
            <li>
              "{randomizeSet.quote}" - {randomizeSet.author}
            </li>
          </ul>
        )
      }

      {!randomizeSet && (
        <div>click the button to generate quote</div>
      )}

      <button onClick={handleRandomize} className='text-'>Randomize</button>
    </div>
  )
}

export default App