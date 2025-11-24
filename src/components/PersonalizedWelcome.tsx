import React, { useEffect } from 'react';
import { RollingText } from './ui/RollingText';

interface PersonalizedWelcomeProps {
  name: string;
  onContinue: () => void;
}

const PersonalizedWelcome: React.FC<PersonalizedWelcomeProps> = ({ name, onContinue }) => {
  useEffect(() => {
    // Auto-continue after text finishes rolling + 1 second
    const textLength = `Happy to have you, ${name}!`.length;
    const timer = setTimeout(() => {
      onContinue();
    }, textLength * 100 + 1000);

    return () => clearTimeout(timer);
  }, [name, onContinue]);

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        <div className="mb-8">
          <img src="/logo.png" alt="University Support Logo" className="w-20 h-20 mx-auto mb-6 object-contain animate-pulse" />
          <h1 className="mb-5">
            <div className="flex flex-col md:block">
              <RollingText
                text="Happy to have you,"
                className="text-3xl md:text-5xl font-medium text-gray-900 leading-[1.15] tracking-tight mr-0 md:mr-3"
                style={{ fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", letterSpacing: '-0.025em' }}
                inView={true}
                transition={{ duration: 0.6, delay: 0.08, ease: "easeOut" }}
                baseDelay={0}
              />
              <RollingText
                text={`${name}!`}
                className="text-3xl md:text-5xl font-medium text-gray-900 leading-[1.15] tracking-tight"
                style={{ fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", letterSpacing: '-0.025em' }}
                inView={true}
                transition={{ duration: 0.6, delay: 0.08, ease: "easeOut" }}
                baseDelay={0.08 * "Happy to have you, ".length}
              />
            </div>
          </h1>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedWelcome;
