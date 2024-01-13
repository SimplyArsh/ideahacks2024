// import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import './index.css';

const recipes = [
  { id: 1, title: 'Recipe 1' },
  { id: 2, title: 'Recipe 2' },
  { id: 3, title: 'Recipe 3' }
];

function ImageRenderer({ imageBinary }) {
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {

    const blob = new Blob([imageBinary]);
    const url = URL.createObjectURL(blob);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageBinary]);

  return (
    <div>
      {imageUrl ? (
        <img src={imageUrl} alt="Rendered Image" />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

const App = () => {

  const [snapshotBinary, updateSnapshotBinary] = useState(null)

  function hexToBase64(str) {
    return btoa(String.fromCharCode.apply(null, str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" ")));
  }
  
  const fetchSnapshot = async () => {
    fetch('http://localhost:4000/api/getSnapshot').then(
        (response) => {
            if (!response.ok) {
                throw new Error('Error getting snapshot')
            }
            return response.json();
        }).then( (data) => {
          updateSnapshotBinary(data[0].data)
        })
  }

  useEffect(() => {
    fetchSnapshot();
  }, [])

  return (
    <div className="app">
      <div className="fridge-snapshot">
        <ImageRenderer imageBinary={snapshotBinary}></ImageRenderer>
      </div>
      <div className="recipes">
        <button className="generate-button">Generate Recipe</button>
        {recipes.map(recipe => (
          <div key={recipe.id} className="recipe-card">
            <h3>{recipe.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;


// import { BrowserRouter, Routes, Route } from 'react-router-dom'

// // pages & components
// import Home from './pages/Home'

// function App() {

//   return (
//     <div className="App">
//       <BrowserRouter>
//         <div className="pages">
//           <Routes>
//             <Route 
//               path="/" 
//               element={<Home />} 
//             />
//           </Routes>
//         </div>
//       </BrowserRouter>
//     </div>
//   );
// }

// export default App;