import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import RackModal from '../components/RackModal';

const Racks = () => {
    const [racks, setRacks] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRack, setSelectedRack] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Style definitions
    const defaultStyle = {
        fill: 'green',
        fillOpacity: '0.3',
        stroke: '#000',
        strokeWidth: '1',
        cursor: 'pointer',
        pointerEvents: 'all'
    };

    const userAccessStyle = {
        fill: '#FF0000',
        fillOpacity: '0.5',
        stroke: '#000',
        strokeWidth: '2',
        cursor: 'pointer',
        pointerEvents: 'all'
    };

    const acStyle = {
        fill: '#87CEEB',
        fillOpacity: '0.5',
        stroke: '#000',
        strokeWidth: '1'
    };
    
    const labelStyle = {
        fill: '#000',
        fontSize: '12px',
        fontFamily: 'Arial',
        pointerEvents: 'none'
    };

    const acLabelStyle = {
        ...labelStyle,
        fontSize: '24px',
        dominantBaseline: 'middle',
        textAnchor: 'middle'
    };

    const getRackStyle = React.useCallback((rackId) => {
        const hasAccess = racks.some(rack => rack.name === rackId);
        return hasAccess ? userAccessStyle : defaultStyle;
    }, [racks]);   

    const handleRackClick = React.useCallback((rackId) => {
        console.log('Rack clicked:', rackId);
        const rack = racks.find(r => r.name === rackId);
        
        if (rack) {
            console.log('Found rack data:', rack);
            setSelectedRack(rack);
            setIsModalOpen(true);
        } else {
            console.warn('No rack found with ID:', rackId);
        }
    }, [racks]);

    const handleCloseModal = React.useCallback(() => {
        setIsModalOpen(false);
        setSelectedRack(null);
    }, []);

    // Render a single rack
    const renderRack = React.useCallback((rack) => (
        <g key={rack.id}>
            <rect
                x={rack.coords[0]}
                y={rack.coords[1]}
                width={rack.coords[2] - rack.coords[0]}
                height={rack.coords[3] - rack.coords[1]}
                {...getRackStyle(rack.id)}
                title={rack.id}
                onClick={() => handleRackClick(rack.id)}
            />
            <text
                x={rack.coords[0] + 5}
                y={rack.coords[1] + 15}
                style={labelStyle}
            >
                {rack.id}
            </text>
        </g>
    ), [getRackStyle, handleRackClick]);

    // Render AC unit
    const renderACWithLabel = React.useCallback((ac) => {
        const width = ac.coords[2] - ac.coords[0];
        const height = ac.coords[3] - ac.coords[1];
        const centerX = ac.coords[0] + (width / 2);
        const centerY = ac.coords[1] + (height / 2);
    
        return (
            <g key={ac.id}>
                <rect
                    x={ac.coords[0]}
                    y={ac.coords[1]}
                    width={width}
                    height={height}
                    {...acStyle}
                    title={ac.id}
                />
                <text
                    x={centerX}
                    y={centerY}
                    style={acLabelStyle}
                >
                    {ac.id}
                </text>
            </g>
        );
    }, []);

    // Fetch racks data
    useEffect(() => {
        const fetchRacks = async () => {
            try {
                const userData = JSON.parse(localStorage.getItem('user'));
                
                if (!userData?.id || !userData?.user_group) {
                    setError('User session expired');
                    return;
                }
    
                const response = await fetch(
                    `http://localhost:5000/racks?userId=${userData.id}&userGroup=${userData.user_group}`
                );
                
                if (!response.ok) {
                    throw new Error('Failed to fetch racks');
                }
                
                const data = await response.json();
                setRacks(data);
            } catch (err) {
                console.error('Fetch error:', err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
    
        fetchRacks();
    }, []);

    if (error === 'User session expired') {
        return <Navigate to="/" replace />;
    }

    const hasAccessToRoom = (roomPrefix) => {
        return racks.some(rack => rack.name.startsWith(roomPrefix));
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Racks</h2>
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <RackModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                rack={selectedRack}
            />

            {isLoading ? (
                <div className="text-center">Loading...</div>
            ) : racks.length === 0 ? (
                <div className="text-center text-gray-500">
                    No racks assigned to you.
                </div>
            ) : (
                <div className="space-y-8">
                    {/* SALA A */}
                    {hasAccessToRoom('A') && (
                        <div className="relative">
                            <h3 className="text-xl font-semibold mb-4">SALA A</h3>
                            <div className="relative w-full" style={{ backgroundColor: '#fff' }}>
                                <svg 
                                    viewBox="0 0 2100 1000"
                                    className="w-full h-full"
                                >
                                {/* AE (top) row */}
                                {[
                                    {id: "AE01", coords: [210, 227, 290, 397]},  // Added 200 to x coordinates
                                    {id: "AE02", coords: [300, 227, 380, 397]},
                                    {id: "AE03", coords: [390, 227, 470, 397]},
                                    {id: "AE04", coords: [480, 227, 560, 397]},
                                    {id: "AE05", coords: [570, 227, 650, 397]},
                                    {id: "AE06", coords: [660, 227, 740, 397]},
                                    {id: "AE07", coords: [750, 227, 830, 397]},
                                    {id: "AE08", coords: [840, 227, 920, 397]},
                                    // Gap in the middle
                                    {id: "AE09", coords: [1200, 227, 1280, 397]},
                                    {id: "AE10", coords: [1290, 227, 1370, 397]},
                                    {id: "AE11", coords: [1380, 227, 1460, 397]},
                                    {id: "AE12", coords: [1470, 227, 1550, 397]},
                                    {id: "AE13", coords: [1560, 227, 1640, 397]},
                                    {id: "AE14", coords: [1650, 227, 1730, 397]},
                                    {id: "AE15", coords: [1740, 227, 1820, 397]},
                                    {id: "AE16", coords: [1830, 227, 1910, 397]},
                                    {id: "AE17", coords: [1920, 227, 2000, 397]}
                                ].map(renderRack)}

                                {/* AG (bottom) row */}
                                {[
                                    {id: "AG01", coords: [210, 582, 290, 747]},
                                    {id: "AG02", coords: [300, 582, 380, 747]},
                                    {id: "AG03", coords: [390, 582, 470, 747]},
                                    {id: "AG04", coords: [480, 582, 560, 747]},
                                    {id: "AG05", coords: [570, 582, 650, 747]},
                                    {id: "AG06", coords: [660, 582, 740, 747]},
                                    {id: "AG07", coords: [750, 582, 830, 747]},
                                    {id: "AG08", coords: [840, 582, 920, 747]},
                                    // Gap in the middle
                                    {id: "AG09", coords: [1200, 582, 1280, 747]},
                                    {id: "AG10", coords: [1290, 582, 1370, 747]},
                                    {id: "AG11", coords: [1380, 582, 1460, 747]},
                                    {id: "AG12", coords: [1470, 582, 1550, 747]},
                                    {id: "AG13", coords: [1560, 582, 1640, 747]},
                                    {id: "AG14", coords: [1650, 582, 1730, 747]},
                                    {id: "AG15", coords: [1740, 582, 1820, 747]},
                                    {id: "AG16", coords: [1830, 582, 1910, 747]},
                                    {id: "AG17", coords: [1920, 582, 2000, 747]}
                                ].map(renderRack)}

                                {/* A/C units */}
                                {[
                                    {id: "AC1", coords: [460, 846, 656, 951]},    // Bottom (50 units up from bottom)
                                    {id: "AC2", coords: [1560, 844, 1759, 949]},  // Bottom (50 units up from bottom)
                                    {id: "AC3", coords: [460, 50, 660, 162]},     // Top (moved down 50 units)
                                    {id: "AC4", coords: [1560, 50, 1754, 157]}    // Top (moved down 50 units)
                                ].map(renderACWithLabel)}
                            </svg>
                        </div>
                    </div>
                    )}

                    {/* SALA B */}
                    {hasAccessToRoom('B') && (
                    <div className="relative mt-8">
                        <h3 className="text-xl font-semibold mb-4">SALA B</h3>
                        <div className="relative w-full" style={{ backgroundColor: '#fff' }}>
                            <svg 
                                className="absolute top-0 left-0 w-full h-full"
                                viewBox="0 0 2100 800"
                                style={{ pointerEvents: 'all' }}
                            >
                                {/* Add cage styling */}
                                {/* Cage 1 */}
                                <rect 
                                    x="5" 
                                    y="425" 
                                    width="280" 
                                    height="140"
                                    fill="none"
                                    stroke="#FFD700"
                                    strokeWidth="2"
                                    strokeDasharray="5,5"
                                />

                                {/* Cage 2 - Around BG09 through BG16 */}
                                <rect 
                                    x="990" 
                                    y="425" 
                                    width="730" 
                                    height="140"
                                    fill="none"
                                    stroke="#FFD700"
                                    strokeWidth="2"
                                    strokeDasharray="5,5"
                                />

                                {/* Cage 3 - Around BD20-23 and BG20-23 */}
                                <rect 
                                    x="1740" 
                                    y="160" 
                                    width="370" 
                                    height="400"
                                    fill="none"
                                    stroke="#FFD700"
                                    strokeWidth="2"
                                    strokeDasharray="5,5"
                                />
                                
                                {/* BD (top) row */}
                                {[
                                    {id: "BD01", coords: [10, 166, 90, 290]},
                                    {id: "BD02", coords: [100, 166, 180, 290]},
                                    {id: "BD03", coords: [190, 166, 270, 290]},
                                    // Gap after BD03
                                    {id: "BD04", coords: [310, 166, 390, 290]},  // Added 40 units gap
                                    {id: "BD05", coords: [400, 166, 480, 290]},
                                    {id: "BD06", coords: [490, 166, 570, 290]},
                                    {id: "BD07", coords: [580, 166, 660, 290]},
                                    {id: "BD08", coords: [670, 166, 750, 290]},
                                    {id: "BD09", coords: [760, 166, 840, 290]},
                                    // Gap in the middle
                                    {id: "BD10", coords: [1000, 166, 1080, 290]},
                                    {id: "BD11", coords: [1090, 166, 1170, 290]},
                                    {id: "BD12", coords: [1180, 166, 1260, 290]},
                                    {id: "BD13", coords: [1270, 166, 1350, 290]},
                                    {id: "BD14", coords: [1360, 166, 1440, 290]},
                                    {id: "BD15", coords: [1450, 166, 1530, 290]},
                                    {id: "BD16", coords: [1540, 166, 1620, 290]},
                                    {id: "BD18", coords: [1630, 166, 1710, 290]},
                                    // Gap before BD20
                                    {id: "BD20", coords: [1750, 166, 1830, 290]},  // Added 40 units gap
                                    {id: "BD21", coords: [1840, 166, 1920, 290]},
                                    {id: "BD22", coords: [1930, 166, 2010, 290]},
                                    {id: "BD23", coords: [2020, 166, 2100, 290]}
                                ].map(renderRack)}

                                {/* BG (bottom) row */}
                                {[
                                    {id: "BG01", coords: [10, 431, 90, 555]},
                                    {id: "BG02", coords: [100, 431, 180, 555]},
                                    {id: "BG03", coords: [190, 431, 270, 555]},
                                    // Gap after BG03
                                    {id: "BG04", coords: [310, 431, 390, 555]},  // Added 40 units gap
                                    {id: "BG05", coords: [400, 431, 480, 555]},
                                    {id: "BG06", coords: [490, 431, 570, 555]},
                                    {id: "BG07", coords: [580, 431, 660, 555]},
                                    {id: "BG08", coords: [670, 431, 750, 555]},
                                    // Gap in the middle
                                    {id: "BG09", coords: [1000, 431, 1080, 555]},
                                    {id: "BG10", coords: [1090, 431, 1170, 555]},
                                    {id: "BG11", coords: [1180, 431, 1260, 555]},
                                    {id: "BG12", coords: [1270, 431, 1350, 555]},
                                    {id: "BG13", coords: [1360, 431, 1440, 555]},
                                    {id: "BG14", coords: [1450, 431, 1530, 555]},
                                    {id: "BG15", coords: [1540, 431, 1620, 555]},
                                    {id: "BG16", coords: [1630, 431, 1710, 555]},
                                    // Gap before BG20
                                    {id: "BG20", coords: [1750, 431, 1830, 555]},  // Added 40 units gap
                                    {id: "BG21", coords: [1840, 431, 1920, 555]},
                                    {id: "BG22", coords: [1930, 431, 2010, 555]},
                                    {id: "BG23", coords: [2020, 431, 2100, 555]}
                                ].map(renderRack)}

                                {/* A/C units */}
                                {[
                                    {id: "AC1", coords: [490, 714, 648, 780]},    // Bottom left
                                    {id: "AC2", coords: [1455, 714, 1613, 782]},  // Bottom right
                                    {id: "AC3", coords: [473, 50, 631, 122]},     // Top left (moved down 42 units to match)
                                    {id: "AC4", coords: [1445, 50, 1601, 120]}    // Top right (moved down 42 units to match)
                                ].map(renderACWithLabel)}
                            </svg>
                        </div>
                    </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Racks;