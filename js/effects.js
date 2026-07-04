const EFFECTS = [
    {
        id: 'none',
        name: 'Clean',
        description: 'No overlay effect applied.',
        apply: (p, width, height) => {
            // Do nothing
        }
    },
    {
        id: 'filmGrain',
        name: 'Film Grain',
        description: 'Subtle cinematic noise.',
        apply: (p, width, height) => {
            p.loadPixels();
            const d = p.pixelDensity();
            const fullW = width * d;
            const fullH = height * d;
            for (let i = 0; i < fullW * fullH * 4; i += 4) {
                const noiseVal = p.random(-25, 25);
                p.pixels[i] = p.constrain(p.pixels[i] + noiseVal, 0, 255);     // R
                p.pixels[i+1] = p.constrain(p.pixels[i+1] + noiseVal, 0, 255); // G
                p.pixels[i+2] = p.constrain(p.pixels[i+2] + noiseVal, 0, 255); // B
            }
            p.updatePixels();
        }
    },
    {
        id: 'crtScanlines',
        name: 'CRT Scanlines',
        description: 'Retro TV horizontal scanlines.',
        apply: (p, width, height) => {
            p.strokeWeight(2);
            for (let y = 0; y < height; y += 4) {
                p.stroke(0, 0, 0, 50);
                p.line(0, y, width, y);
            }
        }
    },
    {
        id: 'vignette',
        name: 'Vignette',
        description: 'Darkened edges focusing the center.',
        apply: (p, width, height) => {
            let gradient = p.drawingContext.createRadialGradient(
                width / 2, height / 2, Math.min(width, height) * 0.4,
                width / 2, height / 2, Math.max(width, height) * 0.7
            );
            gradient.addColorStop(0, 'rgba(0,0,0,0)');
            gradient.addColorStop(1, 'rgba(0,0,0,0.6)');

            p.drawingContext.fillStyle = gradient;
            p.noStroke();
            p.rect(0, 0, width, height);
        }
    },
    {
        id: 'bloom',
        name: 'Soft Bloom',
        description: 'A soft glowing aura over the image.',
        apply: (p, width, height) => {
            // A simple approximation of bloom using a semi-transparent white overlay with screen blending
            p.blendMode(p.SCREEN);
            p.fill(255, 255, 255, 20);
            p.noStroke();
            p.rect(0, 0, width, height);
            p.blendMode(p.BLEND);
        }
    },
    {
        id: 'halftone',
        name: 'Halftone Dots',
        description: 'Comic book style dotted overlay.',
        apply: (p, width, height) => {
            p.fill(0, 0, 0, 30);
            p.noStroke();
            const spacing = 8;
            for(let x = 0; x < width; x += spacing) {
                for(let y = 0; y < height; y += spacing) {
                    if((x/spacing + y/spacing) % 2 === 0) {
                        p.circle(x, y, 2);
                    }
                }
            }
        }
    }
];
