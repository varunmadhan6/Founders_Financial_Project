import React from 'react';

const Team = () => {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-4xl">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl text-center">
            Our Team
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600 text-center mb-12">
            Meet the founders behind Artemis Trading!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Zeynep Bayram */}
            <div className="flex flex-col items-center">
              <img
                className="w-48 h-48 rounded-full object-cover mb-4"
                src="https://35elements.com/wp-content/uploads/elementor/thumbs/Mask-Group-19-p9qek4fkk4vv17pqfsly6ehlmpraqltp0eqwvwwfq8.png"
                alt="Zeynep Bayram"
              />
              <h3 className="text-xl font-semibold text-gray-900">Zeynep Bayram</h3>
              <p className="text-base text-gray-600 mb-2">Co-Founder, CFO</p>
              <div className="flex space-x-4">
                <a 
                  href="https://www.linkedin.com/in/zeynepbasaran/"
                  className="text-blue-600 hover:text-blue-800"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </a>
                <span className="text-gray-400">|</span>
                <a 
                  href="mailto:zeynep@35elements.com"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Email
                </a>
              </div>
            </div>

            {/* Dr. Can Bayram */}
            <div className="flex flex-col items-center">
              <img
                className="w-48 h-48 rounded-full object-cover mb-4"
                src="https://35elements.com/wp-content/uploads/elementor/thumbs/Mask-Group-20-p9qekwmq95ygpikrv4sr97dfg9wb5ixn4abha7qmjk.png"
                alt="Dr. Can Bayram"
              />
              <h3 className="text-xl font-semibold text-gray-900">Dr. Can Bayram</h3>
              <p className="text-base text-gray-600 mb-2">Co-Founder, CEO</p>
              <div className="flex space-x-4">
                <a 
                  href="https://www.linkedin.com/in/canbayram/"
                  className="text-blue-600 hover:text-blue-800"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </a>
                <span className="text-gray-400">|</span>
                <a 
                  href="mailto:can@35elements.com"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Email
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Team;