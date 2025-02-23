import React from 'react';

const Home = () => {
    return (
        <div className='w-full h-screen'>
            <img className='top-0 left-0 w-full h-screen object-cover' src="https://fox5sandiego.com/wp-content/uploads/sites/15/2020/03/AP20086453484483.jpg?w=2560&h=1440&crop=1" alt = '/'/>
            <div className='bg-black/60 absolute top-0 left-0 w-full h-screen'/>
            <div className = 'absolute top-0 w-full h-full flex flex-col justify-center text-white'>
                <div className='md:left-[10%] max-w-[1100px] m-auto absolute p-4 space-y-3'>
                    <p>Welcome To</p>
                    <h1 className='font-bold text-5xl md:text-7xl drop-shadow-l'>Stock Stripper</h1>
                    <p className = 'max-w-[600px] drop-shadow-2xl py-2 text-m'>A one-stop shop for everything and anything related to stocks. Click below to sign up and gain access
                        to our premium features, including but not limited to stock reports, a personalized portfolio, and advice from verified financial advisors.
                    </p>
                    <button className='bg-white text-black font-sans'>Sign Up Now</button>
                </div>
            </div>
        </div>
    )
}

export default Home