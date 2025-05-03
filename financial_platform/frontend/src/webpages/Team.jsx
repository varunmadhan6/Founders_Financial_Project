import React from 'react';

const Team = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section - Changed from blue to gray */}
      <div className="bg-gray-300 text-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Meet Our Leadership Team
          </h1>
          <p className="text-xl text-center text-gray-600 max-w-2xl mx-auto">
            Bringing together decades of experience in finance, technology, and market analysis
          </p>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              {/* Zeynep Bayram */}
              <div className="flex flex-col items-center group">
                <div className="relative">
                  <div className="w-56 h-56 rounded-full overflow-hidden mb-6 border-4 border-blue-100 shadow-lg transition-transform duration-300 group-hover:scale-105">
                    <img
                      className="w-full h-full object-cover"
                      src="https://35elements.com/wp-content/uploads/elementor/thumbs/Mask-Group-19-p9qek4fkk4vv17pqfsly6ehlmpraqltp0eqwvwwfq8.png"
                      alt="Zeynep Bayram"
                    />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Zeynep Bayram</h3>
                <p className="text-lg text-blue-600 mb-3">Co-Founder, CFO</p>
                <p className="text-gray-600 text-center mb-4 max-w-sm">
                  Leading our financial strategy with expertise in investment management and market analysis.
                </p>
                <div className="flex space-x-4">
                  <a 
                    href="https://www.linkedin.com/in/zeynepbasaran/"
                    className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-300"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    LinkedIn
                  </a>
                  <a 
                    href="mailto:zeynep@35elements.com"
                    className="px-4 py-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors duration-300"
                  >
                    Email
                  </a>
                </div>
              </div>

              {/* Dr. Can Bayram */}
              <div className="flex flex-col items-center group">
                <div className="relative">
                  <div className="w-56 h-56 rounded-full overflow-hidden mb-6 border-4 border-blue-100 shadow-lg transition-transform duration-300 group-hover:scale-105">
                    <img
                      className="w-full h-full object-cover"
                      src="https://35elements.com/wp-content/uploads/elementor/thumbs/Mask-Group-20-p9qekwmq95ygpikrv4sr97dfg9wb5ixn4abha7qmjk.png"
                      alt="Dr. Can Bayram"
                    />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Dr. Can Bayram</h3>
                <p className="text-lg text-blue-600 mb-3">Co-Founder, CTO</p>
                <p className="text-gray-600 text-center mb-4 max-w-sm">
                  Driving technological innovation with deep expertise in algorithmic trading and market analysis systems.
                </p>
                <div className="flex space-x-4">
                  <a 
                    href="https://www.linkedin.com/in/canbayram/"
                    className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-300"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    LinkedIn
                  </a>
                  <a 
                    href="mailto:can@35elements.com"
                    className="px-4 py-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors duration-300"
                  >
                    Email
                  </a>
                </div>
              </div>
            </div>

            {/* Company Values Section */}
            <div className="mt-24 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Values</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                  <h3 className="text-xl font-semibold text-blue-600 mb-3">Innovation</h3>
                  <p className="text-gray-600">Pushing boundaries in financial technology and market analysis</p>
                </div>
                <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                  <h3 className="text-xl font-semibold text-blue-600 mb-3">Integrity</h3>
                  <p className="text-gray-600">Maintaining the highest standards of professional ethics</p>
                </div>
                <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                  <h3 className="text-xl font-semibold text-blue-600 mb-3">Excellence</h3>
                  <p className="text-gray-600">Delivering outstanding results for our clients</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Team;