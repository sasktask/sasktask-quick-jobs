import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Crosshair,
  Compass,
  Layers,
  Maximize2,
  Minus,
  Plus,
  RotateCcw,
  Map,
  Satellite,
  Mountain,
  Grid3X3,
  Navigation,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface MapQuickActionsProps {
  onCenterLocation: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onToggleExplorer: () => void;
  onStyleChange: (style: string) => void;
  currentStyle: string;
  hasUserLocation: boolean;
  className?: string;
}

const MAP_STYLES = [
  { id: 'streets-v12', label: 'Streets', icon: Map },
  { id: 'satellite-streets-v12', label: 'Satellite', icon: Satellite },
  { id: 'outdoors-v12', label: 'Outdoors', icon: Mountain },
];

export function MapQuickActions({
  onCenterLocation,
  onZoomIn,
  onZoomOut,
  onResetView,
  onToggleExplorer,
  onStyleChange,
  currentStyle,
  hasUserLocation,
  className,
}: MapQuickActionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex flex-col gap-1 ${className}`}
    >
      <TooltipProvider delayDuration={300}>
        {/* Explorer Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="bg-background/90 backdrop-blur-sm shadow-lg h-10 w-10"
              onClick={onToggleExplorer}
            >
              <Compass className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Open Explorer</p>
          </TooltipContent>
        </Tooltip>

        {/* Divider */}
        <div className="h-px bg-border my-1" />

        {/* Center on Location */}
        {hasUserLocation && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="bg-background/90 backdrop-blur-sm shadow-lg h-10 w-10"
                onClick={onCenterLocation}
              >
                <Crosshair className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Center on my location</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Zoom Controls */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="bg-background/90 backdrop-blur-sm shadow-lg h-10 w-10"
              onClick={onZoomIn}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Zoom in</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="bg-background/90 backdrop-blur-sm shadow-lg h-10 w-10"
              onClick={onZoomOut}
            >
              <Minus className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Zoom out</p>
          </TooltipContent>
        </Tooltip>

        {/* Reset View */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="bg-background/90 backdrop-blur-sm shadow-lg h-10 w-10"
              onClick={onResetView}
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Reset view</p>
          </TooltipContent>
        </Tooltip>

        {/* Divider */}
        <div className="h-px bg-border my-1" />

        {/* Map Styles */}
        {MAP_STYLES.map((style) => (
          <Tooltip key={style.id}>
            <TooltipTrigger asChild>
              <Button
                variant={currentStyle.includes(style.id) ? 'default' : 'secondary'}
                size="icon"
                className={`backdrop-blur-sm shadow-lg h-10 w-10 ${
                  currentStyle.includes(style.id) ? '' : 'bg-background/90'
                }`}
                onClick={() => onStyleChange(`mapbox://styles/mapbox/${style.id}`)}
              >
                <style.icon className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>{style.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </motion.div>
  );
}
