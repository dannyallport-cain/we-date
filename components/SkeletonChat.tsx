import React from 'react';

export default function SkeletonChat() {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header Skeleton */}
      <div className="h-16 border-b flex items-center px-4 gap-3 bg-white">
         <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" /> {/* Back btn */}
         <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" /> {/* Avatar */}
         <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" /> {/* Name */}
      </div>

      {/* Messages Skeleton */}
      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
         {/* Incoming */}
         <div className="flex justify-start items-end gap-2 max-w-[80%]">
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
            <div className="bg-gray-100 rounded-2xl rounded-bl-none p-4 w-full animate-pulse">
               <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
               <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
         </div>

         {/* Outgoing */}
         <div className="flex justify-end items-end gap-2">
             <div className="bg-gray-100/50 rounded-2xl rounded-br-none p-4 max-w-[80%] w-64 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3 ml-auto" />
             </div>
         </div>

         {/* Incoming */}
         <div className="flex justify-start items-end gap-2 max-w-[70%]">
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
            <div className="bg-gray-100 rounded-2xl rounded-bl-none p-4 w-full animate-pulse">
               <div className="h-4 bg-gray-200 rounded w-full" />
            </div>
         </div>
      </div>

      {/* Input Skeleton */}
      <div className="h-20 border-t p-4 flex gap-2 items-center">
         <div className="h-12 flex-1 bg-gray-100 rounded-full animate-pulse" />
         <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
      </div>
    </div>
  );
}
