import React, { Suspense } from 'react';

const SkillGraph = React.lazy(() => import('../components/SkillGraph'));

function SkillGraphLoader() {
  return (
    <div className='flex h-screen w-full items-center justify-center'>
      <div className='flex flex-col items-center gap-6'>
        {/* Glow ring */}
        <div className='relative h-20 w-20'>
          <div className='absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur-lg opacity-60 animate-pulse' />
          <div className='relative h-full w-full rounded-full border-4 border-neutral-800 border-t-indigo-500 animate-spin' />
        </div>

        {/* Text */}
        <div className='text-center'>
          <p className='text-lg font-medium text-neutral-300'>
            Loading skill network
          </p>
          <p className='mt-1 text-md text-neutral-500'>
            Rendering connections & nodes…
          </p>
        </div>
      </div>
    </div>
  );
}
export default function SkillNetwork() {
  return (
    <div>
      <Suspense fallback={<SkillGraphLoader />}>
        <SkillGraph />
        {/* <SkillGraphLoader /> */}
      </Suspense>
    </div>
  );
}
