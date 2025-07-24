import { parseString, Builder } from 'xml2js';
import { FrameData } from '@/types/project';

export interface FrameXMLData {
  frame: {
    $: {
      id: string;
      version: string;
      aspectRatio: string;
    };
    objects: {
      object: Array<{
        $: {
          id: string;
          type: string;
          x: string;
          y: string;
          width: string;
          height: string;
          rotation: string;
          zIndex: string;
        };
        properties: {
          property: Array<{
            $: {
              name: string;
              value: string;
            };
          }>;
        };
        imageRef?: string;
      }>;
    };
  };
}

export const serializeFrameToXML = (frames: FrameData[], aspectRatio: string): string => {
  const xmlData: FrameXMLData = {
    frame: {
      $: {
        id: crypto.randomUUID(),
        version: '1.0',
        aspectRatio
      },
      objects: {
        object: frames.map(frame => ({
          $: {
            id: frame.id,
            type: frame.type,
            x: frame.x.toString(),
            y: frame.y.toString(),
            width: frame.width.toString(),
            height: frame.height.toString(),
            rotation: frame.rotation.toString(),
            zIndex: frame.zIndex.toString()
          },
          properties: {
            property: Object.entries(frame.properties).map(([name, value]) => ({
              $: {
                name,
                value: typeof value === 'string' ? value : JSON.stringify(value)
              }
            }))
          },
          ...(frame.imageRef && { imageRef: frame.imageRef })
        }))
      }
    }
  };

  const builder = new Builder({
    xmldec: { version: '1.0', encoding: 'UTF-8' },
    renderOpts: { pretty: true, indent: '  ' }
  });

  return builder.buildObject(xmlData);
};

export const parseFrameFromXML = (xmlString: string): Promise<FrameData[]> => {
  return new Promise((resolve, reject) => {
    parseString(xmlString, (err, result: FrameXMLData) => {
      if (err) {
        reject(err);
        return;
      }

      try {
        const frames: FrameData[] = result.frame.objects.object.map(obj => ({
          id: obj.$.id,
          type: obj.$.type as FrameData['type'],
          x: parseFloat(obj.$.x),
          y: parseFloat(obj.$.y),
          width: parseFloat(obj.$.width),
          height: parseFloat(obj.$.height),
          rotation: parseFloat(obj.$.rotation),
          zIndex: parseInt(obj.$.zIndex),
          properties: obj.properties.property.reduce((props, prop) => {
            try {
              props[prop.$.name] = JSON.parse(prop.$.value);
            } catch {
              props[prop.$.name] = prop.$.value;
            }
            return props;
          }, {} as Record<string, any>),
          ...(obj.imageRef && { imageRef: obj.imageRef })
        }));

        resolve(frames);
      } catch (parseError) {
        reject(parseError);
      }
    });
  });
};

export const validateFrameXML = (xmlString: string): boolean => {
  try {
    parseString(xmlString, (err) => {
      if (err) return false;
    });
    return true;
  } catch {
    return false;
  }
};