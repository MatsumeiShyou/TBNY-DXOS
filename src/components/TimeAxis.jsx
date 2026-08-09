export default function TimeAxis({ timeSlots }) {
  return (
    <div className="w-16 flex-shrink-0 bg-gray-50 border-r border-gray-300 sticky left-0 z-30">
      {timeSlots.map((time) => {
        const isHour = time.endsWith('00');
        const borderClass = isHour ? 'border-t border-t-orange-300 border-b border-b-gray-100 font-bold bg-gray-100' : 'border-b border-b-gray-200';
        return (
          <div key={time} className={`h-8 flex items-center justify-end pr-2 text-xs text-gray-500 ${borderClass}`}>
            {isHour ? time : `:${time.split(':')[1]}`}
          </div>
        );
      })}
    </div>
  );
}
