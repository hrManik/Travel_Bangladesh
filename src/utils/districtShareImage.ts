import bangladeshGeoData from '../data/bangladeshDistrictsGeo.json';
import { DistrictInfo } from '../types';

type Position = number[];
type PolygonCoordinates = Position[][];

interface DistrictFeature {
  properties: { id: string };
  geometry: {
    type: string;
    coordinates: PolygonCoordinates | PolygonCoordinates[];
  };
}

const features = (bangladeshGeoData as { features: DistrictFeature[] }).features;

function getPolygons(feature: DistrictFeature): PolygonCoordinates[] {
  const { type, coordinates } = feature.geometry;
  return type === 'Polygon'
    ? [coordinates as PolygonCoordinates]
    : (coordinates as PolygonCoordinates[]);
}

export function createDistrictShareImage(district: DistrictInfo): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;

  const context = canvas.getContext('2d');
  if (!context) {
    return Promise.reject(new Error('Your browser could not create the share image.'));
  }

  const background = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  background.addColorStop(0, '#0f172a');
  background.addColorStop(1, '#064e3b');
  context.fillStyle = background;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = '#22c55e';
  context.fillRect(0, 0, canvas.width, 18);
  context.fillStyle = '#86efac';
  context.font = 'bold 26px sans-serif';
  context.fillText('GREEN BANGLADESH • MY TRAVEL MAP', 76, 100);
  context.fillStyle = '#ffffff';
  context.font = 'bold 66px sans-serif';
  context.fillText('I VISITED', 76, 190);
  context.font = 'bold 54px sans-serif';
  context.fillText(district.name, 76, 262, 920);
  context.fillStyle = '#d1fae5';
  context.font = '36px sans-serif';
  context.fillText(`${district.nameBn} • ${district.division} Division`, 76, 316, 920);

  let minLongitude = Infinity;
  let maxLongitude = -Infinity;
  let minLatitude = Infinity;
  let maxLatitude = -Infinity;
  for (const feature of features) {
    for (const polygon of getPolygons(feature)) {
      for (const ring of polygon) {
        for (const [longitude, latitude] of ring) {
          minLongitude = Math.min(minLongitude, longitude);
          maxLongitude = Math.max(maxLongitude, longitude);
          minLatitude = Math.min(minLatitude, latitude);
          maxLatitude = Math.max(maxLatitude, latitude);
        }
      }
    }
  }
  const mapBounds = { left: 100, top: 370, width: 880, height: 790 };
  const longitudeScale = Math.cos(((minLatitude + maxLatitude) * Math.PI) / 360);
  const mapWidth = (maxLongitude - minLongitude) * longitudeScale;
  const mapHeight = maxLatitude - minLatitude;
  const scale = Math.min(mapBounds.width / mapWidth, mapBounds.height / mapHeight);
  const renderedWidth = mapWidth * scale;
  const renderedHeight = mapHeight * scale;
  const offsetX = mapBounds.left + (mapBounds.width - renderedWidth) / 2;
  const offsetY = mapBounds.top + (mapBounds.height - renderedHeight) / 2;

  const project = ([longitude, latitude]: Position): [number, number] => [
    offsetX + (longitude - minLongitude) * longitudeScale * scale,
    offsetY + (maxLatitude - latitude) * scale,
  ];

  for (const feature of features) {
    context.beginPath();
    for (const polygon of getPolygons(feature)) {
      for (const ring of polygon) {
        ring.forEach((position, index) => {
          const [x, y] = project(position);
          if (index === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        });
        context.closePath();
      }
    }

    context.fillStyle = feature.properties.id === district.id ? '#22c55e' : '#f8fafc';
    context.strokeStyle = '#14532d';
    context.lineWidth = 2;
    context.fill('evenodd');
    context.stroke();
  }

  context.fillStyle = '#ffffff';
  context.font = '28px sans-serif';
  context.fillText('My Bangladesh journey, one district at a time.', 76, 1230);
  context.fillStyle = '#bbf7d0';
  context.font = '22px sans-serif';
  context.fillText('Green = my visited district  •  White = other districts', 76, 1272);
  context.fillStyle = '#d1d5db';
  context.font = '18px sans-serif';
  context.fillText(`© ${new Date().getFullYear()} Manik. All rights reserved.`, 76, 1315);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('The district map image could not be generated.'));
    }, 'image/png');
  });
}
