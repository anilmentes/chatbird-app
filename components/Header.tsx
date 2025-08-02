import React from 'react';
import { ChatBirdLogoIcon } from './Icon';

const Header: React.FC = () => {
  return (
    <header className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white p-4 shadow-md border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto flex items-center justify-center">
        <ChatBirdLogoIcon className="h-8 w-8 text-blue-500 mr-3" />
        <h1 className="text-2xl font-bold tracking-tight">
          ChatBird
        </h1>
      </div>
    </header>
  );
};

export default Header;