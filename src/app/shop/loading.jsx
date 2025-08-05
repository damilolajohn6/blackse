import React from 'react'

const loading = () => {
  return (
    <div className="min-h-screen grid place-content-center">
        <div className="loader">
            <div className="loader__bar"></div>
            <div className="loader__bar"></div>
            <div className="loader__bar"></div>
            <div className="loader__bar"></div>
            <div className="loader__bar"></div>
            <div className="loader__ball"></div>
        </div>
    </div>
  )
}

export default loading