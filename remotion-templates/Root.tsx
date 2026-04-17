import React from 'react';
import { Composition } from 'remotion';
import { compositionRegistry } from './compositions';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {compositionRegistry.map((composition) => (
        <Composition
          key={composition.id}
          id={composition.id}
          component={composition.component as React.FC}
          durationInFrames={composition.durationInFrames}
          fps={composition.fps}
          width={composition.width}
          height={composition.height}
          defaultProps={composition.defaultProps}
        />
      ))}
    </>
  );
};
