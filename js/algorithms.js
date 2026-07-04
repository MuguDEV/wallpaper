const ALGORITHMS = [
    {
        id: 'fractalTopography',
        name: 'Fractal Topography',
        category: 'Organic',
        description: 'Layered noise creating mountainous landscapes.',
        popular: true,
        params: {
            layers: { type: 'range', min: 3, max: 20, value: 10, label: 'Layer Count' },
            noiseScale: { type: 'range', min: 0.01, max: 0.2, value: 0.1, step: 0.01, label: 'Noise Scale' },
            heightVariability: { type: 'range', min: 0.1, max: 0.5, value: 0.2, step: 0.05, label: 'Height Variability' }
        },
        draw: (p, colors, width, height, params) => {
            p.background(p.color(colors[0]));
            p.noStroke();
            let yoff = 0;
            const layers = params.layers.value;
            const noiseScale = params.noiseScale.value;
            const heightVar = params.heightVariability.value;

            const stepY = (height * 0.8) / layers;

            for (let y = height * (1 - (layers * 0.1)); y < height; y += stepY) {
                let colorIdx = Math.floor(p.random(1, colors.length));
                // Avoid picking the background color again if possible
                if(colorIdx === 0 && colors.length > 1) colorIdx = 1;

                let fillCol = p.color(colors[colorIdx]);
                fillCol.setAlpha(200);
                p.fill(fillCol);
                p.beginShape();
                p.vertex(0, height);
                let xoff = 0;
                for (let x = 0; x <= width; x += width * 0.05) {
                    let mapY = p.map(p.noise(xoff, yoff), 0, 1, -height * heightVar, height * heightVar);
                    p.vertex(x, y + mapY);
                    xoff += noiseScale;
                }
                p.vertex(width, height);
                p.endShape(p.CLOSE);
                yoff += 0.2;
            }
        }
    },
    {
        id: 'liquidMetal',
        name: 'Liquid Metal',
        category: 'Abstract',
        description: 'Smooth, flowing curves resembling molten material.',
        popular: false,
        params: {
            curveCount: { type: 'range', min: 50, max: 500, value: 150, label: 'Curve Count' },
            strokeWeight: { type: 'range', min: 1, max: 20, value: 5, label: 'Max Stroke Weight' },
            opacity: { type: 'range', min: 10, max: 255, value: 150, label: 'Opacity' }
        },
        draw: (p, colors, width, height, params) => {
            p.background(p.color(colors[0]));
            p.noFill();

            const count = params.curveCount.value;
            const maxWeight = params.strokeWeight.value;
            const opacity = params.opacity.value;

            for (let i = 0; i < count; i++) {
                let strokeCol = p.color(colors[p.floor(p.random(1, colors.length))]);
                strokeCol.setAlpha(opacity);
                p.stroke(strokeCol);
                p.strokeWeight(p.random(1, maxWeight));
                p.beginShape();
                // Using fixed random offsets instead of millis() for static render reproducibility
                const xOffset = p.random(1000);
                const yOffset = p.random(1000);
                for (let j = 0; j < 6; j++) {
                    let x = p.noise(i * 0.05, j * 0.2 + xOffset) * width * 1.5 - (width*0.25);
                    let y = p.noise(j * 0.2 + yOffset, i * 0.05) * height * 1.5 - (height*0.25);
                    p.curveVertex(x, y);
                }
                p.endShape();
            }
        }
    },
    {
        id: 'neuralLace',
        name: 'Neural Lace',
        category: 'Tech',
        description: 'Interconnected nodes forming a complex web.',
        popular: true,
        params: {
            nodeCount: { type: 'range', min: 20, max: 200, value: 100, label: 'Node Count' },
            connectDist: { type: 'range', min: 0.05, max: 0.3, value: 0.15, step: 0.01, label: 'Connection Distance' },
            nodeSize: { type: 'range', min: 1, max: 20, value: 8, label: 'Max Node Size' }
        },
        draw: (p, colors, width, height, params) => {
            p.background(p.color(colors[0]));

            const numNodes = params.nodeCount.value;
            const maxDist = width * params.connectDist.value;
            const maxSize = params.nodeSize.value;

            const nodes = [];
            for (let i = 0; i < numNodes; i++) {
                nodes.push({
                    x: p.random(width),
                    y: p.random(height),
                    color: p.color(colors[p.floor(p.random(1, colors.length))])
                });
            }

            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    let d = p.dist(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
                    if (d < maxDist) {
                        let strokeCol = p.lerpColor(nodes[i].color, nodes[j].color, 0.5);
                        strokeCol.setAlpha(p.map(d, 0, maxDist, 255, 0));
                        p.stroke(strokeCol);
                        p.strokeWeight(1);
                        p.line(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
                    }
                }
                p.noStroke();
                p.fill(nodes[i].color);
                p.circle(nodes[i].x, nodes[i].y, p.random(3, maxSize));
            }
        }
    },
    {
        id: 'glacialFracture',
        name: 'Glacial Fracture',
        category: 'Geometry',
        description: 'Sharp, angular shards and crystalline structures.',
        popular: false,
        params: {
            shards: { type: 'range', min: 10, max: 200, value: 50, label: 'Shard Count' },
            shardSize: { type: 'range', min: 0.05, max: 0.5, value: 0.2, step: 0.05, label: 'Shard Size' },
            transparency: { type: 'range', min: 10, max: 255, value: 200, label: 'Opacity' }
        },
        draw: (p, colors, width, height, params) => {
            p.background(p.color(colors[0]));
            const shardCount = params.shards.value;
            const size = params.shardSize.value;
            const alpha = params.transparency.value;

            for (let i = 0; i < shardCount; i++) {
                let col = p.color(colors[p.floor(p.random(1, colors.length))]);
                col.setAlpha(alpha);
                p.fill(col);
                p.noStroke();
                p.beginShape();
                let startX = p.random(width);
                let startY = p.random(height);
                p.vertex(startX, startY);
                for(let j=0; j<4; j++) {
                    p.vertex(startX + p.random(-width*size, width*size), startY + p.random(-height*size, height*size));
                }
                p.endShape(p.CLOSE);
            }
        }
    },
    {
        id: 'cosmicDust',
        name: 'Cosmic Dust',
        category: 'Space',
        description: 'Scattered particles creating a nebulous starfield.',
        popular: false,
        params: {
            stars: { type: 'range', min: 500, max: 5000, value: 2000, label: 'Star Count' },
            nebulas: { type: 'range', min: 1, max: 20, value: 5, label: 'Nebula Count' },
            glowSize: { type: 'range', min: 0.1, max: 1.0, value: 0.5, step: 0.1, label: 'Nebula Size' }
        },
        draw: (p, colors, width, height, params) => {
            p.background(p.color(colors[0]));
            p.noStroke();

            const starCount = params.stars.value;
            const nebCount = params.nebulas.value;
            const size = params.glowSize.value;

            for (let i = 0; i < starCount; i++) {
                let x = p.random(width);
                let y = p.random(height);
                let r = p.random(0.5, 3);
                let col = p.color(colors[p.floor(p.random(1, colors.length))]);
                col.setAlpha(p.random(50, 255));
                p.fill(col);
                p.circle(x, y, r);
            }

            for(let i=0; i<nebCount; i++) {
                let x = p.random(width);
                let y = p.random(height);
                let col = p.color(colors[p.floor(p.random(1, colors.length))]);
                for(let r=width*size; r>0; r-=width*0.05) {
                    col.setAlpha(p.map(r, width*size, 0, 0, 50));
                    p.fill(col);
                    p.circle(x, y, r);
                }
            }
        }
    },
    {
        id: 'inkWash',
        name: 'Ink Wash',
        category: 'Artistic',
        description: 'Soft, overlapping watercolor-like brush strokes.',
        popular: false,
        params: {
            strokes: { type: 'range', min: 10, max: 300, value: 100, label: 'Stroke Count' },
            brushSize: { type: 'range', min: 0.1, max: 0.8, value: 0.3, step: 0.1, label: 'Max Brush Size' },
            density: { type: 'range', min: 1, max: 30, value: 10, label: 'Splotch Density' }
        },
        draw: (p, colors, width, height, params) => {
            p.background(p.color(colors[0]));
            p.noStroke();

            const strokeCount = params.strokes.value;
            const maxSize = params.brushSize.value;
            const density = params.density.value;

            for(let i=0; i<strokeCount; i++) {
                let x = p.random(width);
                let y = p.random(height);
                let col = p.color(colors[p.floor(p.random(1, colors.length))]);
                let r = p.random(width*0.05, width*maxSize);

                for(let j=0; j<density; j++) {
                    let offsetX = p.random(-r*0.2, r*0.2);
                    let offsetY = p.random(-r*0.2, r*0.2);
                    col.setAlpha(p.random(5, 20));
                    p.fill(col);
                    p.circle(x + offsetX, y + offsetY, r * p.random(0.8, 1.2));
                }
            }
        }
    },
    {
        id: 'quantumFoam',
        name: 'Quantum Foam',
        category: 'Abstract',
        description: 'Bubbling, effervescent spherical overlapping structures.',
        popular: true,
        params: {
            bubbles: { type: 'range', min: 50, max: 1000, value: 300, label: 'Bubble Count' },
            maxSize: { type: 'range', min: 0.05, max: 0.4, value: 0.15, step: 0.05, label: 'Max Size' }
        },
        draw: (p, colors, width, height, params) => {
            p.background(p.color(colors[0]));

            const count = params.bubbles.value;
            const size = params.maxSize.value;

            for (let i = 0; i < count; i++) {
                let x = p.random(width);
                let y = p.random(height);
                let r = p.random(width * 0.01, width * size);
                let col1 = p.color(colors[p.floor(p.random(1, colors.length))]);

                let gradient = p.drawingContext.createRadialGradient(x, y, 0, x, y, r);
                gradient.addColorStop(0, col1.toString());
                gradient.addColorStop(1, p.color(0,0,0,0).toString());

                p.drawingContext.fillStyle = gradient;
                p.noStroke();
                p.circle(x, y, r * 2);
            }
        }
    },
    {
        id: 'matrixRain',
        name: 'Matrix Rain',
        category: 'Tech',
        description: 'Digital rain composed of flowing vertical data streams.',
        popular: true,
        params: {
            density: { type: 'range', min: 10, max: 60, value: 20, label: 'Column Width' },
            maxLength: { type: 'range', min: 10, max: 100, value: 40, label: 'Max Stream Length' }
        },
        draw: (p, colors, width, height, params) => {
            p.background(p.color(colors[0]));
            const colWidth = params.density.value;
            const maxLen = params.maxLength.value;

            const cols = p.floor(width / colWidth);
            p.textSize(colWidth * 0.8);
            p.textFont('monospace');
            for(let i=0; i<cols; i++) {
                let y = p.random(-height, height);
                let streamLength = p.random(10, maxLen);
                for(let j=0; j<streamLength; j++) {
                    let char = String.fromCharCode(0x30A0 + p.random(0, 96));
                    let alpha = p.map(j, 0, streamLength, 255, 0);
                    let col = p.color(colors[p.floor(p.random(1, colors.length))]);
                    col.setAlpha(alpha);
                    p.fill(col);
                    p.text(char, i*colWidth, y - j*(colWidth));
                }
            }
        }
    },
    {
        id: 'hexGrid',
        name: 'Hex Grid',
        category: 'Geometry',
        description: 'A tessellating network of colored hexagons.',
        popular: false,
        params: {
            hexSize: { type: 'range', min: 10, max: 100, value: 30, label: 'Hexagon Size' },
            fillChance: { type: 'range', min: 0.1, max: 1.0, value: 0.7, step: 0.1, label: 'Fill Probability' },
            strokeWeight: { type: 'range', min: 0, max: 5, value: 1, label: 'Stroke Weight' }
        },
        draw: (p, colors, width, height, params) => {
            p.background(p.color(colors[0]));

            const size = params.hexSize.value;
            const fillProb = params.fillChance.value;
            const sWeight = params.strokeWeight.value;

            const w = p.sqrt(3) * size;
            const h = 2 * size;
            const yOffset = 3/4 * h;

            p.strokeWeight(sWeight);
            if(sWeight === 0) p.noStroke();
            else p.stroke(p.color(colors[1] || colors[0]));

            for(let row = -1; row < height/yOffset + 2; row++) {
                for(let col = -1; col < width/w + 2; col++) {
                    let x = col * w + (row % 2 === 1 ? w/2 : 0);
                    let y = row * yOffset;

                    let fillCol = p.color(colors[p.floor(p.random(1, colors.length))]);
                    if(p.random() > fillProb) fillCol.setAlpha(0); // empty
                    else fillCol.setAlpha(p.random(100, 255));

                    p.fill(fillCol);
                    p.beginShape();
                    for (let a = 0; a < p.TWO_PI; a += p.TWO_PI / 6) {
                        let vx = x + p.cos(a + p.PI/6) * size;
                        let vy = y + p.sin(a + p.PI/6) * size;
                        p.vertex(vx, vy);
                    }
                    p.endShape(p.CLOSE);
                }
            }
        }
    },
    {
        id: 'bokeh',
        name: 'Bokeh Effect',
        category: 'Organic',
        description: 'Soft out-of-focus circular highlights.',
        popular: true,
        params: {
            circleCount: { type: 'range', min: 20, max: 500, value: 150, label: 'Circle Count' },
            maxRadius: { type: 'range', min: 0.1, max: 0.5, value: 0.2, step: 0.05, label: 'Max Radius' }
        },
        draw: (p, colors, width, height, params) => {
            p.background(p.color(colors[0]));
            p.noStroke();

            const count = params.circleCount.value;
            const size = params.maxRadius.value;

            for(let i=0; i<count; i++) {
                let x = p.random(width);
                let y = p.random(height);
                let r = p.random(width * 0.05, width * size);
                let col = p.color(colors[p.floor(p.random(1, colors.length))]);
                col.setAlpha(p.random(20, 80));
                p.fill(col);
                p.circle(x, y, r);

                // Add a slightly smaller, brighter inner circle
                col.setAlpha(p.random(40, 100));
                p.fill(col);
                p.circle(x, y, r * 0.8);
            }
        }
    },
    {
        id: 'flowField',
        name: 'Flow Field',
        category: 'Organic',
        description: 'Particles tracing paths through a noise field.',
        popular: true,
        params: {
            particles: { type: 'range', min: 100, max: 5000, value: 1000, label: 'Particle Count' },
            steps: { type: 'range', min: 10, max: 200, value: 30, label: 'Simulation Steps' },
            noiseScale: { type: 'range', min: 0.001, max: 0.02, value: 0.005, step: 0.001, label: 'Noise Scale' }
        },
        draw: (p, colors, width, height, params) => {
            p.background(p.color(colors[0]));

            const partCount = params.particles.value;
            const steps = params.steps.value;
            const nScale = params.noiseScale.value;

            const particles = [];
            for(let i=0; i<partCount; i++) {
                particles.push(p.createVector(p.random(width), p.random(height)));
            }

            p.strokeWeight(1);
            p.noFill();

            for(let i=0; i<steps; i++) { // simulate steps
                for(let j=0; j<particles.length; j++) {
                    let particle = particles[j];
                    let angle = p.noise(particle.x * nScale, particle.y * nScale) * p.TWO_PI * 4;
                    let v = p5.Vector.fromAngle(angle);
                    v.setMag(10);

                    let col = p.color(colors[j % (colors.length - 1) + 1]);
                    col.setAlpha(20);
                    p.stroke(col);

                    p.line(particle.x, particle.y, particle.x + v.x, particle.y + v.y);
                    particle.add(v);
                }
            }
        }
    },
    {
        id: 'synthwaveSun',
        name: 'Synthwave Sun',
        category: 'Retro',
        description: 'An iconic retro-futuristic grid and sunset.',
        popular: true,
        params: {
            sunSize: { type: 'range', min: 0.1, max: 0.6, value: 0.3, step: 0.05, label: 'Sun Size' },
            gridDensity: { type: 'range', min: 10, max: 100, value: 40, label: 'Grid Density' },
            horizonLevel: { type: 'range', min: 0.3, max: 0.8, value: 0.6, step: 0.05, label: 'Horizon Level' }
        },
        draw: (p, colors, width, height, params) => {
            p.background(p.color(colors[0]));

            const sunScale = params.sunSize.value;
            const density = params.gridDensity.value;
            const hLevel = params.horizonLevel.value;

            // Grid
            p.strokeWeight(2);
            p.stroke(p.color(colors[1]));
            let horizon = height * hLevel;
            for(let i=0; i<width; i+=density) {
                p.line(i, horizon, (i - width/2) * 5 + width/2, height);
            }
            for(let j=horizon; j<height; j+=Math.pow((j-horizon)/5, 1.5) + 5) {
                p.line(0, j, width, j);
            }

            // Sun
            p.noStroke();
            let sunX = width / 2;
            let sunY = horizon;
            let sunR = p.min(width, height) * sunScale;

            let gradient = p.drawingContext.createLinearGradient(0, sunY - sunR, 0, sunY);
            gradient.addColorStop(0, colors[2] || '#ff007f');
            gradient.addColorStop(1, colors[3] || '#ffaa00');

            p.drawingContext.fillStyle = gradient;
            p.circle(sunX, sunY - 20, sunR * 2);

            // Sun slices
            p.fill(p.color(colors[0]));
            for(let s=0; s<5; s++) {
                p.rect(sunX - sunR, sunY - 30 - s*20, sunR*2, 4 + s*2);
            }
        }
    },
    {
        id: 'circuitBoard',
        name: 'Circuit Board',
        category: 'Tech',
        description: 'Right-angled digital pathways and nodes.',
        popular: false,
        params: {
            paths: { type: 'range', min: 10, max: 200, value: 50, label: 'Path Count' },
            nodesPerPath: { type: 'range', min: 2, max: 10, value: 4, label: 'Nodes/Path' },
            nodeSize: { type: 'range', min: 2, max: 12, value: 6, label: 'Node Size' }
        },
        draw: (p, colors, width, height, params) => {
            p.background(p.color(colors[0]));
            p.strokeWeight(2);
            p.noFill();

            const pathCount = params.paths.value;
            const nodes = params.nodesPerPath.value;
            const size = params.nodeSize.value;

            for(let i=0; i<pathCount; i++) {
                let x = p.random(width);
                let y = p.random(height);
                let col = p.color(colors[p.floor(p.random(1, colors.length))]);
                p.stroke(col);
                p.fill(col);
                p.circle(x, y, size);
                p.noFill();

                p.beginShape();
                p.vertex(x, y);
                for(let j=0; j<nodes; j++) {
                    if(p.random() > 0.5) {
                        x += p.random(-100, 100);
                    } else {
                        y += p.random(-100, 100);
                    }
                    p.vertex(x, y);
                }
                p.endShape();
                p.fill(col);
                p.circle(x, y, size);
                p.noFill();
            }
        }
    },
    {
        id: 'minimalCurves',
        name: 'Minimal Curves',
        category: 'Minimal',
        description: 'Clean, overlapping, broad sweeping curves.',
        popular: true,
        params: {
            curveCount: { type: 'range', min: 1, max: 10, value: 5, label: 'Curve Count' },
            flatness: { type: 'range', min: 0.1, max: 1.0, value: 0.5, step: 0.1, label: 'Curve Flatness' }
        },
        draw: (p, colors, width, height, params) => {
            p.background(p.color(colors[0]));
            p.noStroke();

            const count = params.curveCount.value;
            const flatness = params.flatness.value;

            for(let i=0; i<count; i++) {
                let colorIdx = (i % (colors.length - 1)) + 1; // cycle through colors, skip bg
                if (colors.length === 1) colorIdx = 0;
                let col = p.color(colors[colorIdx]);
                col.setAlpha(200); // slightly transparent for overlapping
                p.fill(col);
                p.beginShape();
                p.vertex(0, height);

                let startY = height * (1 - (i+1)/(count+1)) + p.random(-height*0.1, height*0.1);
                p.vertex(0, startY);

                // create bezier curve
                let cp1x = p.random(width * 0.2, width * 0.4);
                let cp1y = startY + p.random(-height * flatness, height * flatness);
                let cp2x = p.random(width * 0.6, width * 0.8);
                let cp2y = startY + p.random(-height * flatness, height * flatness);
                let ex = width;
                let ey = height * (1 - (i+1)/(count+1)) + p.random(-height*0.1, height*0.1);

                p.bezierVertex(cp1x, cp1y, cp2x, cp2y, ex, ey);
                p.vertex(width, height);
                p.endShape(p.CLOSE);
            }
        }
    },
    {
        id: 'sakuraPetals',
        name: 'Sakura Petals',
        category: 'Nature',
        description: 'Falling petals blown gently across the screen.',
        popular: false,
        params: {
            petalCount: { type: 'range', min: 50, max: 1000, value: 300, label: 'Petal Count' },
            minSize: { type: 'range', min: 2, max: 10, value: 5, label: 'Min Size' },
            maxSize: { type: 'range', min: 10, max: 40, value: 15, label: 'Max Size' }
        },
        draw: (p, colors, width, height, params) => {
            p.background(p.color(colors[0]));
            p.noStroke();

            const count = params.petalCount.value;
            const minS = params.minSize.value;
            const maxS = params.maxSize.value;

            for(let i=0; i<count; i++) {
                let x = p.random(width);
                let y = p.random(height);
                let s = p.random(minS, maxS);
                let rot = p.random(p.TWO_PI);

                let col = p.color(colors[p.floor(p.random(1, colors.length))]);
                col.setAlpha(p.random(150, 255));
                p.fill(col);

                p.push();
                p.translate(x, y);
                p.rotate(rot);
                // simple petal shape
                p.beginShape();
                p.vertex(0, -s);
                p.bezierVertex(s, -s, s, s, 0, s);
                p.bezierVertex(-s, s, -s, -s, 0, -s);
                p.endShape(p.CLOSE);
                p.pop();
            }
        }
    },
    {
        id: 'gradientMesh',
        name: 'Gradient Mesh',
        category: 'Abstract',
        description: 'Smooth, blurred overlapping gradients.',
        popular: true,
        params: {
            blobs: { type: 'range', min: 2, max: 30, value: 10, label: 'Blob Count' },
            minSize: { type: 'range', min: 0.1, max: 0.5, value: 0.4, step: 0.05, label: 'Min Size' },
            maxSize: { type: 'range', min: 0.5, max: 1.5, value: 1.0, step: 0.1, label: 'Max Size' }
        },
        draw: (p, colors, width, height, params) => {
            p.background(p.color(colors[0]));
            p.noStroke();

            const blobs = params.blobs.value;
            const minS = params.minSize.value;
            const maxS = params.maxSize.value;

            for(let i=0; i<blobs; i++) {
                let x = p.random(width);
                let y = p.random(height);
                let r = p.random(width * minS, width * maxS);
                let col = p.color(colors[p.floor(p.random(1, colors.length))]);

                let gradient = p.drawingContext.createRadialGradient(x, y, 0, x, y, r);
                gradient.addColorStop(0, col.toString());
                gradient.addColorStop(1, p.color(0,0,0,0).toString());

                p.drawingContext.fillStyle = gradient;
                p.circle(x, y, r * 2);
            }
        }
    }
];
