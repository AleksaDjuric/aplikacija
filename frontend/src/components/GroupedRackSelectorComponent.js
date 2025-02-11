import React, { useState } from 'react';
import { FaChevronRight } from 'react-icons/fa';

const GroupedRackSelector = ({ rooms, racks, selectedRacks, onChange }) => {
  const [openRooms, setOpenRooms] = useState({});

  const toggleRoom = (roomId) => {
    setOpenRooms(prev => ({
      ...prev,
      [roomId]: !prev[roomId]
    }));
  };

  const getRacksForRoom = (roomId) => {
    return racks.filter(rack => rack.room_id === roomId);
  };

  return (
    <div className="space-y-2">
      {rooms.map(room => {
        const roomRacks = getRacksForRoom(room.id);
        if (roomRacks.length === 0) return null;

        return (
          <div key={room.id} className="ml-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleRoom(room.id)}
                className="flex items-center text-gray-700 hover:text-gray-900"
              >
                <FaChevronRight
                  className={`transform transition-transform ${
                    openRooms[room.id] ? 'rotate-90' : ''
                  }`}
                />
                <span className="ml-1">{room.name}</span>
                <span className="text-sm text-gray-500 ml-1">
                  ({roomRacks.length} {roomRacks.length === 1 ? 'rack' : 'racks'})
                </span>
              </button>
            </div>
            
            {openRooms[room.id] && (
              <div className="ml-6 mt-1 flex flex-wrap gap-2">
                {roomRacks.map(rack => (
                  <label key={rack.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedRacks.includes(rack.id)}
                      onChange={(e) => {
                        const newSelected = e.target.checked
                          ? [...selectedRacks, rack.id]
                          : selectedRacks.filter(id => id !== rack.id);
                        onChange(newSelected);
                      }}
                      className="form-checkbox h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm">{rack.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default GroupedRackSelector;