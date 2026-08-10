import React from 'react'

const Container = ({children,className}) => {
  return (
    <div className={`md:w-[85%] w-[90%] mx-auto ${className}`}>
      {children}
    </div>
  )
}

export default Container