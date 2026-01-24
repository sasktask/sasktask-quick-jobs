import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';

interface Task {
  id: string;
  title: string;
  description?: string;
  location: string;
  pay_amount: number;
  category: string;
  latitude: number;
  longitude: number;
  estimated_duration?: number;
  priority?: string;
}

interface MapTaskMarkerProps {
  map: mapboxgl.Map | null;
  task: Task;
  isSelected?: boolean;
  isNew?: boolean;
  onClick?: (task: Task) => void;
  onGetDirections?: (task: Task) => void;
}

export function createTaskPopupHTML(task: Task): string {
  const isUrgent = task.priority === 'urgent';
  
  return `
    <div class="task-popup" style="
      min-width: 280px;
      max-width: 320px;
      font-family: system-ui, -apple-system, sans-serif;
    ">
      <div style="
        padding: 12px 16px;
        border-bottom: 1px solid hsl(var(--border));
      ">
        <div style="display: flex; align-items: flex-start; gap: 8px; justify-content: space-between;">
          <h3 style="
            margin: 0;
            font-size: 15px;
            font-weight: 600;
            color: hsl(var(--foreground));
            line-height: 1.3;
          ">${task.title}</h3>
          ${isUrgent ? `
            <span style="
              background: #ef4444;
              color: white;
              font-size: 10px;
              font-weight: 600;
              padding: 2px 6px;
              border-radius: 4px;
              white-space: nowrap;
            ">⚡ URGENT</span>
          ` : ''}
        </div>
      </div>
      
      <div style="padding: 12px 16px;">
        <div style="
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin-bottom: 12px;
          padding: 10px 12px;
          background: hsl(var(--muted) / 0.5);
          border-radius: 8px;
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 2px;">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <div style="flex: 1; min-width: 0;">
            <p style="
              margin: 0;
              font-size: 13px;
              font-weight: 500;
              color: hsl(var(--foreground));
              line-height: 1.4;
            ">${task.location}</p>
            <p style="
              margin: 4px 0 0 0;
              font-size: 11px;
              color: hsl(var(--muted-foreground));
            ">📍 ${task.latitude.toFixed(4)}, ${task.longitude.toFixed(4)}</p>
          </div>
        </div>
        
        <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px;">
          <span style="
            background: linear-gradient(135deg, #22c55e, #16a34a);
            color: white;
            font-size: 13px;
            font-weight: 600;
            padding: 4px 10px;
            border-radius: 6px;
            display: inline-flex;
            align-items: center;
            gap: 4px;
          ">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
            $${task.pay_amount}
          </span>
          <span style="
            background: hsl(var(--secondary));
            color: hsl(var(--secondary-foreground));
            font-size: 12px;
            font-weight: 500;
            padding: 4px 10px;
            border-radius: 6px;
          ">${task.category}</span>
          ${task.estimated_duration ? `
            <span style="
              background: hsl(var(--muted));
              color: hsl(var(--muted-foreground));
              font-size: 12px;
              font-weight: 500;
              padding: 4px 10px;
              border-radius: 6px;
              display: inline-flex;
              align-items: center;
              gap: 4px;
            ">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              ~${task.estimated_duration}h
            </span>
          ` : ''}
        </div>
        
        ${task.description ? `
          <p style="
            margin: 0 0 12px 0;
            font-size: 12px;
            color: hsl(var(--muted-foreground));
            line-height: 1.5;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          ">${task.description}</p>
        ` : ''}
        
        <div style="display: flex; gap: 8px;">
          <button 
            onclick="window.open('/task/${task.id}', '_self')"
            style="
              flex: 1;
              padding: 10px 16px;
              background: hsl(var(--primary));
              color: hsl(var(--primary-foreground));
              border: none;
              border-radius: 8px;
              font-size: 13px;
              font-weight: 600;
              cursor: pointer;
              transition: opacity 0.2s;
            "
            onmouseover="this.style.opacity='0.9'"
            onmouseout="this.style.opacity='1'"
          >View Task</button>
          <button
            onclick="window.dispatchEvent(new CustomEvent('get-directions', { detail: { taskId: '${task.id}' } }))"
            style="
              padding: 10px 14px;
              background: hsl(var(--secondary));
              color: hsl(var(--secondary-foreground));
              border: none;
              border-radius: 8px;
              font-size: 13px;
              font-weight: 500;
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 6px;
              transition: background 0.2s;
            "
            onmouseover="this.style.background='hsl(var(--accent))'"
            onmouseout="this.style.background='hsl(var(--secondary))'"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 3v18h18"></path>
              <path d="m19 9-5 5-4-4-3 3"></path>
            </svg>
            Directions
          </button>
        </div>
      </div>
    </div>
  `;
}

export function MapTaskMarker({
  map,
  task,
  isSelected = false,
  isNew = false,
  onClick,
  onGetDirections,
}: MapTaskMarkerProps) {
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);

  useEffect(() => {
    if (!map) return;

    // Create marker element
    const el = document.createElement('div');
    el.className = 'task-marker';
    
    const isUrgent = task.priority === 'urgent';
    const bgColor = isUrgent ? '#ef4444' : isNew ? '#22c55e' : '#8b5cf6';
    const glowColor = isUrgent ? 'rgba(239,68,68,0.4)' : isNew ? 'rgba(34,197,94,0.4)' : 'rgba(139,92,246,0.3)';
    
    el.innerHTML = `
      <div style="
        position: relative;
        cursor: pointer;
        transform: translateY(-50%);
      ">
        ${isSelected || isUrgent ? `
          <div style="
            position: absolute;
            inset: -8px;
            border-radius: 50%;
            background: ${glowColor};
            animation: pulse 2s infinite;
          "></div>
        ` : ''}
        <div style="
          position: relative;
          width: 36px;
          height: 36px;
          background: ${bgColor};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="
            transform: rotate(45deg);
            color: white;
            font-size: 11px;
            font-weight: 700;
          ">$${task.pay_amount}</span>
        </div>
        <div style="
          position: absolute;
          bottom: -20px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0,0,0,0.8);
          color: white;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 10px;
          white-space: nowrap;
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
        ">${task.title.slice(0, 20)}${task.title.length > 20 ? '...' : ''}</span>
      </div>
    `;

    // Create popup
    popupRef.current = new mapboxgl.Popup({
      offset: 25,
      closeButton: true,
      closeOnClick: false,
      maxWidth: '340px',
      className: 'task-popup-container',
    }).setHTML(createTaskPopupHTML(task));

    // Create marker
    markerRef.current = new mapboxgl.Marker(el)
      .setLngLat([task.longitude, task.latitude])
      .setPopup(popupRef.current)
      .addTo(map);

    // Click handler
    el.addEventListener('click', () => {
      onClick?.(task);
    });

    // Listen for directions event
    const handleDirections = (e: CustomEvent) => {
      if (e.detail?.taskId === task.id) {
        onGetDirections?.(task);
      }
    };
    window.addEventListener('get-directions', handleDirections as EventListener);

    return () => {
      markerRef.current?.remove();
      window.removeEventListener('get-directions', handleDirections as EventListener);
    };
  }, [map, task, isSelected, isNew, onClick, onGetDirections]);

  return null;
}

// Add CSS animation for pulse
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.2); opacity: 0.5; }
  }
  
  .mapboxgl-popup-content {
    padding: 0 !important;
    border-radius: 12px !important;
    overflow: hidden;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2) !important;
  }
  
  .mapboxgl-popup-close-button {
    font-size: 20px !important;
    color: hsl(var(--muted-foreground)) !important;
    padding: 8px 12px !important;
    right: 0 !important;
    top: 0 !important;
  }
  
  .mapboxgl-popup-close-button:hover {
    background: hsl(var(--muted) / 0.5) !important;
    color: hsl(var(--foreground)) !important;
  }
  
  .task-popup-container .mapboxgl-popup-tip {
    border-top-color: hsl(var(--background)) !important;
  }
`;
if (!document.querySelector('#task-marker-styles')) {
  style.id = 'task-marker-styles';
  document.head.appendChild(style);
}
