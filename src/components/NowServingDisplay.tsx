import React from 'react';
import { useNowServingFeed } from '../hooks/useNowServingFeed';
import { DisplayBoardHeader } from './display/DisplayBoardHeader';
import { ReadyPickupBoard } from './display/ReadyPickupBoard';
import { PreparingBoard } from './display/PreparingBoard';
import { DisplayBoardFooter } from './display/DisplayBoardFooter';

export const NowServingDisplay: React.FC = () => {
  const { feed, currentTime } = useNowServingFeed();

  return (
    <div className="min-h-[calc(100vh-80px)] bg-ink-900 text-white p-4 sm:p-8 flex flex-col justify-between">
      <DisplayBoardHeader currentTime={currentTime} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8 flex-1">
        <ReadyPickupBoard tokens={feed?.tokens.ready || []} />
        <PreparingBoard tokens={feed?.tokens.preparing || []} />
      </div>

      <DisplayBoardFooter recentlyServed={feed?.tokens.recentlyServed || []} />
    </div>
  );
};
