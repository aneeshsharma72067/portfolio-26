import React, { Suspense } from 'react';

const SkillGraph = React.lazy(() => import('../components/SkillGraph'));

export default function SkillNetwork() {
  return (
    <div>
      <Suspense fallback={'Loading...'}>
        <SkillGraph />
      </Suspense>
    </div>
  );
}
