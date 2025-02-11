import React, { useState, useEffect } from 'react';
import { Power } from 'lucide-react';
import '../App.css';

const RackModal = ({ isOpen, onClose, rack }) => {
  const [equipment, setEquipment] = useState([]);
  const TOTAL_UNITS = 42;

  useEffect(() => {
    const fetchEquipment = async () => {
      if (!rack?.id) return;
      try {
        const response = await fetch('http://localhost:5000/equipment');
        if (!response.ok) throw new Error('Failed to fetch equipment');
        const data = await response.json();
        setEquipment(data.filter(eq => eq.rack_id === rack.id));
      } catch (error) {
        console.error('Error fetching equipment:', error);
      }
    };

    if (isOpen && rack) {
      fetchEquipment();
    }
  }, [isOpen, rack]);

  if (!isOpen || !rack) return null;

  const renderUnit = (unitNumber, side) => {
    const currentEquipment = equipment.find(
      eq => unitNumber >= eq.start_unit && unitNumber < eq.start_unit + eq.size
    );

    return (
      <div 
        key={`${side}-${unitNumber}`}
        style={{
          height: '11px',
          width: '100%',
          background: currentEquipment ? 'black' : 'transparent',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          position: 'relative'
        }}
      >
        {currentEquipment && currentEquipment.start_unit === unitNumber && (
          <div style={{
            position: 'absolute',
            left: 0,
            color: 'white',
            fontSize: '12px',
            padding: '2px 4px',
            height: '100%',
            display: 'flex',
            alignItems: 'center'
          }}>
            {currentEquipment.name} ({currentEquipment.size}U)
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="rack-modal-container">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div 
        className="rack-modal-content" 
        style={{ 
          width: '60vw', 
          maxWidth: '1200px', 
          height: '65vh', 
          maxHeight: '800px' 
        }}
      >
        {/* Header */}
        <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'black', padding: '10px 12px' }}>
          <span style={{ color: 'white', fontSize: '14px' }}>Naziv Rack-a: {rack.name}</span>
        </div>

        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'black',
            color: 'white',
            padding: '10px 12px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          X
        </button>

        {/* Rack Sides Container */}
        <div className="rack-sides-container">
          {/* Front Side */}
          <div className="rack-side">
            <div style={{ 
              width: '100%', 
              background: 'linear-gradient(to right, #4299e1, #ed64a6)',
              padding: '1px',
              marginBottom: '8px'
            }}>
              {Array.from({ length: TOTAL_UNITS }).map((_, i) => 
                renderUnit(TOTAL_UNITS - i, 'front')
              )}
            </div>
            <div style={{ background: 'black', color: 'white', padding: '4px', textAlign: 'center', fontSize: '12px' }}>
              Prednja strana Rack-a
            </div>
          </div>

          {/* Back Side */}
          <div className="rack-side">
            <div style={{ 
              width: '100%', 
              background: 'linear-gradient(to right, #4299e1, #ed64a6)',
              padding: '1px',
              marginBottom: '8px'
            }}>
              {Array.from({ length: TOTAL_UNITS }).map((_, i) => 
                renderUnit(TOTAL_UNITS - i, 'back')
              )}
            </div>
            <div style={{ background: 'black', color: 'white', padding: '4px', textAlign: 'center', fontSize: '12px' }}>
              Zadnja strana Rack-a
            </div>
          </div>
        </div>

        {/* Power Status */}
        <div style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)' }}>
          <div style={{ background: 'black', color: 'white', padding: '12px', marginBottom: '20px', borderRadius: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Power className="animate-spin" size={20} />
              <div>
                <div style={{ fontSize: '14px' }}>Trenutna potrosnja:</div>
                <div style={{ fontSize: '14px' }}>{rack.PDU_leva || '3kw'} (PDU letva leva)</div>
              </div>
            </div>
          </div>
          <div style={{ background: 'black', color: 'white', padding: '12px', borderRadius: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Power className="animate-spin" size={20} />
              <div>
                <div style={{ fontSize: '14px' }}>Trenutna potrosnja:</div>
                <div style={{ fontSize: '14px' }}>{rack.PDU_desna || '3kw'} (PDU letva desna)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'black', color: 'white', padding: '10px 14px', fontSize: '14px' }}>
          Vlasnik: {rack.owner || 'Boosteroid'}
        </div>
      </div>
    </div>
  );
};

export default RackModal;