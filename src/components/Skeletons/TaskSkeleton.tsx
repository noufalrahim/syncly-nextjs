export default function TaskSkeleton() {
  return (
    <div className="w-full p-4 bg-gray-200 rounded-xl animate-pulse flex flex-col gap-3">
      <div className="h-4 w-3/4 bg-gray-300 rounded" />
      <div className="h-3 w-1/2 bg-gray-300 rounded" />
      <div className="h-3 w-full bg-gray-300 rounded" />
    </div>
  );
}
