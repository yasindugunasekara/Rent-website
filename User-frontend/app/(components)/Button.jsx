'use client'


function Button() {
    const handleClick= () =>{
        alert("Button clicked");
        console.log("Button clicked")
    }


  return (
    <button onClick={handleClick}>Click here</button>)
}

export default Button 