import React, { useState, useEffect } from 'react';
import { FaUser, FaServer, FaTrash, FaEdit, FaChevronDown } from 'react-icons/fa';
import GroupedRackSelector from '../components/GroupedRackSelectorComponent';

const Settings = () => {
  const [activeCard, setActiveCard] = useState('Users');
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [racks, setRacks] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [error, setError] = useState('');

  const validateRackName = (name) => {
    const rackNamePattern = /^[A-Z]{2}\d{2}$/;
    return rackNamePattern.test(name);
  };
  
  // Form states
  const [editingId, setEditingId] = useState(null);
  const [openRooms, setOpenRooms] = useState({});
  const [selectedRacks, setSelectedRacks] = useState([]);
  const [openUsers, setOpenUsers] = useState({});
  const [userRacks, setUserRacks] = useState({});
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    user_group: 'user',
    name: '',
    room_id: '',
    rack_id: '',
    size: '',
    start_unit: '',
    owner: '',
    PDU_leva: '',
    PDU_desna: ''
  });
  const toggleRoom = (roomId) => {
    setOpenRooms(prev => ({
      ...prev,
      [roomId]: !prev[roomId]
    }));
  };

  const toggleUser = (userId) => {
    setOpenUsers(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  useEffect(() => {
    fetchData();
  }, [activeCard]);

  useEffect(() => {
    const fetchUserRacks = async () => {
        try {
            const promises = users.map(user => 
                fetch(`http://localhost:5000/user-racks/${user.id}`)
                    .then(res => res.json())
                    .then(racks => [user.id, racks])
            );
            const results = await Promise.all(promises);
            const userRacksMap = Object.fromEntries(results);
            setUserRacks(userRacksMap);
        } catch (error) {
            setError('Failed to fetch user racks');
        }
    };
    
    if (users.length > 0) {
        fetchUserRacks();
    }
  }, [users]);

  const fetchData = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData) {
        throw new Error('User session expired');
      }

      switch (activeCard) {
        case 'Users':
          const userRes = await fetch('http://localhost:5000/users');
          if (!userRes.ok) throw new Error('Failed to fetch users');
          setUsers(await userRes.json());
          break;
        case 'Racks':
          const roomsRes = await fetch('http://localhost:5000/rooms');
          const racksRes = await fetch(`http://localhost:5000/racks?userId=${userData.id}&userGroup=${userData.user_group}`);
          const equipRes = await fetch('http://localhost:5000/equipment');
          
          if (!roomsRes.ok) throw new Error('Failed to fetch rooms');
          if (!racksRes.ok) throw new Error('Failed to fetch racks');
          if (!equipRes.ok) throw new Error('Failed to fetch equipment');
          
          setRooms(await roomsRes.json());
          setRacks(await racksRes.json());
          setEquipment(await equipRes.json());
          break;
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to fetch data');
    }
  };  

  const handleSubmit = async (e, type) => {
    e.preventDefault();
    const endpoint = `http://localhost:5000/${type}`;
    
    try {
      let response;
      let body = {};
      
      switch (type) {
        case 'users':
          body = {
            username: formData.username,
            password: formData.password,
            user_group: formData.user_group
          };
          break;
        case 'rooms':
          body = { name: formData.name };
          break;
        case 'racks':
          body = { 
            name: formData.name,
            room_id: parseInt(formData.room_id) // Ensure room_id is a number
          };
          break;
        case 'equipment':
          body = {
            rack_id: formData.rack_id,
            name: formData.name,
            size: formData.size,
            start_unit: formData.start_unit
          };
          break;
      }

      if (editingId) {
        response = await fetch(`${endpoint}/${editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
      } else {
          response = await fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body)
          });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Operation failed');
      }

      const userData = await response.json();

      if (type === 'users' && formData.user_group !== 'admin') {
        const rackUpdateResponse = await fetch(`http://localhost:5000/user-racks/${userData.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rackIds: selectedRacks })
        });

        if (!rackUpdateResponse.ok) {
            throw new Error('Failed to update rack assignments');
        }
      }
      
      fetchData();
      resetForm();
      if (type === 'users') {
        setSelectedRacks([]);
      }
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id, type) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await fetch(`http://localhost:5000/${type}/${id}`, { method: 'DELETE' });
        fetchData();
      } catch (err) {
        setError('Delete operation failed');
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      username: '',
      password: '',
      user_group: 'user',
      name: '',
      room_id: '',
      rack_id: '',
      size: '',
      start_unit: ''
    });
  };

  const startEdit = (item, type) => {
    setEditingId(item.id);
    const editData = {
      ...formData,
      name: item.name
    };
    
    switch (type) {
      case 'users':
        editData.username = item.username;
        editData.user_group = item.user_group;
        break;
      case 'racks':
        editData.room_id = item.room_id;
        editData.owner = item.owner;
        editData.PDU_leva = item.PDU_leva;
        editData.PDU_desna = item.PDU_desna;
        break;
      case 'equipment':
        editData.rack_id = item.rack_id;
        editData.size = item.size;
        editData.start_unit = item.start_unit;
        break;
    }
    
    setFormData(editData);
  };

  const handleRackSubmit = async (e, roomId) => {
    e.preventDefault();
    
    // Validate rack name
    if (!validateRackName(formData.name)) {
        setError('Invalid rack name format. Name must be 2 uppercase letters followed by 2 digits (e.g., AE01)');
        return;
    }

    const endpoint = 'http://localhost:5000/racks';
    
    try {
        const body = {
          name: formData.name.toUpperCase(), // Force uppercase
          room_id: roomId,
          owner: formData.owner,
          PDU_leva: formData.PDU_leva,
          PDU_desna: formData.PDU_desna
        };

        let response;
        if (editingId) {
            response = await fetch(`${endpoint}/${editingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
        } else {
            response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to save rack');
        }

        await fetchData();
        resetForm();
    } catch (err) {
        console.error('Error saving rack:', err);
        setError(err.message);
    }
  };

  const renderUserForm = () => (
    <div className="mb-6">
      <form onSubmit={(e) => handleSubmit(e, 'users')} className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">{editingId ? 'Edit User' : 'Add New User'}</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="p-2 border rounded"
              required
            />
            <input
              type="password"
              placeholder={editingId ? "New Password (optional)" : "Password"}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="p-2 border rounded"
              required={!editingId}
            />
            <select
              value={formData.user_group}
              onChange={(e) => setFormData({...formData, user_group: e.target.value})}
              className="p-2 border rounded"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {formData.user_group === 'user' && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-700 mb-2">Assign Racks</h4>
              <GroupedRackSelector 
                racks={racks}
                rooms={rooms}
                selectedRacks={selectedRacks}
                onChange={setSelectedRacks}
              />
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              {editingId ? 'Update' : 'Add'} User
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );


  const renderUserList = () => (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-xl font-semibold mb-4">User List</h3>
      <div className="space-y-2">
        {users.map(user => (
          <div key={user.id} className="border rounded-lg">
            <div className="px-4 py-3 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <span className="font-medium">{user.username} </span>
                <span className="text-sm text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                  / {user.user_group}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    startEdit(user, 'users');
                    // Set selected racks when editing
                    setSelectedRacks(userRacks[user.id] ? userRacks[user.id].map(rack => rack.id) : []);
                  }}
                  className="text-blue-500 hover:text-blue-700 p-1"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(user.id, 'users')}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <FaTrash />
                </button>
                <FaChevronDown
                  className={`transform transition-transform ${
                    openUsers[user.id] ? 'rotate-180' : ''
                  } cursor-pointer`}
                  onClick={() => toggleUser(user.id)}
                />
              </div>
            </div>
            
            {openUsers[user.id] && (
              <div className="p-4 border-t">
                {user.user_group === 'user' && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-700">Current Rack Assignments</h4>
                    <div className="text-sm text-gray-600">
                      {userRacks[user.id] && userRacks[user.id].length > 0 ? (
                        userRacks[user.id].map(rack => (
                          <div key={rack.id} className="py-1">
                            {rack.name}
                          </div>
                        ))
                      ) : (
                        <div className="italic">No racks assigned</div>
                      )}
                    </div>
                  </div>
                )}
                {user.user_group === 'admin' && (
                  <div className="text-gray-500 italic">
                    Admin users have access to all racks
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderUserSection = () => (
    <div className="space-y-6">
      {renderUserForm()}
      {renderUserList()}
    </div>
  );

  const renderRackForm = (roomId) => (
    <form onSubmit={(e) => handleRackSubmit(e, roomId)} className="mb-4">
      <div className="flex gap-2">
      <input
          type="text"
          placeholder="Rack Name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className="p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Owner"
          value={formData.owner}
          onChange={(e) => setFormData({...formData, owner: e.target.value})}
          className="p-2 border rounded"
        />
        <input
          type="text"
          placeholder="PDU letva leva"
          value={formData.PDU_leva}
          onChange={(e) => setFormData({...formData, PDU_leva: e.target.value})}
          className="p-2 border rounded"
        />
        <input
          type="text"
          placeholder="PDU letva desna"
          value={formData.PDU_desna}
          onChange={(e) => setFormData({...formData, PDU_desna: e.target.value})}
          className="p-2 border rounded"
        />
        <button 
          type="submit" 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {editingId ? 'Update' : 'Add'} Rack
        </button>
        {editingId && (
          <button 
            type="button" 
            onClick={resetForm} 
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );

  const renderRackSection = () => (
    <div className="grid grid-cols-1 gap-6">
      {/* Rooms & Racks Management */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Room & Rack Management</h3>
        
        {/* Room Form */}
        <form onSubmit={(e) => handleSubmit(e, 'rooms')} className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Room Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="p-2 border rounded flex-1"
              required
            />
            <button 
              type="submit" 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              {editingId ? 'Update' : 'Add'} Room
            </button>
            {editingId && (
              <button 
                type="button" 
                onClick={resetForm} 
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Accordion */}
        <div className="border rounded-lg divide-y">
          {rooms.map(room => (
            <div key={room.id} className="border-b last:border-b-0">
              {/* Accordion Header */}
              <button
                onClick={() => toggleRoom(room.id)}
                className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{room.name}</span>
                  <span className="text-sm text-gray-500">
                    ({racks.filter(rack => rack.room_id === room.id).length} racks)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(room, 'rooms');
                    }}
                    className="text-blue-500 hover:text-blue-700 p-1"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(room.id, 'rooms');
                    }}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <FaTrash />
                  </button>
                  <FaChevronDown
                    className={`transform transition-transform ${
                      openRooms[room.id] ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Accordion Content */}
              {openRooms[room.id] && (
                <div className="p-4 bg-white">
                  {/* Rack Form */}
                  {renderRackForm(room.id)}

                  {/* Racks List */}
                  <div className="space-y-2">
                    {racks.filter(rack => rack.room_id === room.id).map(rack => (
                      <div key={rack.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span>{rack.name}</span>
                        <div className="space-x-2">
                          <button
                            onClick={() => startEdit(rack, 'racks')}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(rack.id, 'racks')}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Equipment Management */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Equipment</h3>
        <form onSubmit={(e) => handleSubmit(e, 'equipment')} className="mb-4 space-y-2">
          <select
            value={formData.rack_id}
            onChange={(e) => setFormData({...formData, rack_id: e.target.value})}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select Rack</option>
            {racks.map(rack => (
              <option key={rack.id} value={rack.id}>{rack.name}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Equipment Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full p-2 border rounded"
            required
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Size (U)"
              value={formData.size}
              onChange={(e) => setFormData({...formData, size: e.target.value})}
              className="p-2 border rounded"
              required
            />
            <input
              type="number"
              placeholder="Start Unit"
              value={formData.start_unit}
              onChange={(e) => setFormData({...formData, start_unit: e.target.value})}
              className="p-2 border rounded"
              required
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              {editingId ? 'Update' : 'Add'} Equipment
            </button>
            {editingId && (
              <button 
                type="button" 
                onClick={resetForm} 
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
        <div className="space-y-2">
          {equipment.map(eq => (
            <div key={eq.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <div>
                <span className="font-medium">{eq.name}</span>
                <span className="text-sm text-gray-500 ml-2">
                  ({eq.size}U at U{eq.start_unit}) - {racks.find(r => r.id === eq.rack_id)?.name}
                </span>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => startEdit(eq, 'equipment')}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(eq.id, 'equipment')}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div className="flex gap-4">
        {[
          { name: 'Users', icon: <FaUser size={24} /> },
          { name: 'Racks', icon: <FaServer size={24} /> }
        ].map((card) => (
          <button
            key={card.name}
            onClick={() => {
              setActiveCard(card.name);
              resetForm();
            }}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg ${
              activeCard === card.name
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {card.icon}
            <span>{card.name}</span>
          </button>
        ))}
      </div>

      {activeCard === 'Users' && renderUserSection()}
      {activeCard === 'Racks' && renderRackSection()}
    </div>
  );
};

export default Settings;