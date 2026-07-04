const ALGORITHMS = [
    {
        id: 'fractalTopography',
        name: 'Fractal Topography',
        category: 'Organic',
        description: 'Layered noise creating mountainous landscapes.',
        popular: true,
        draw: (p, colors, width, height) => {
            p.background(p.color(colors[0]));
            p.noStroke();
            let yoff = 0;
            for (let y = height * 0.2; y < height; y += height * 0.05) {
                let fillCol = p.color(colors[Math.floor(p.random(1, colors.length))]);
                fillCol.setAlpha(200);
                p.fill(fillCol);
                p.beginShape();
                p.vertex(0, height);
                let xoff = 0;
                for (let x = 0; x <= width; x += width * 0.05) {
                    let mapY = p.map(p.noise(xoff, yoff), 0, 1, -height * 0.2, height * 0.2);
                    p.vertex(x, y + mapY);
                    xoff += 0.1;
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
        draw: (p, colors, width, height) => {
            p.background(p.color(colors[0]));
            p.noFill();
            for (let i = 0; i < 150; i++) {
                let strokeCol = p.color(colors[p.floor(p.random(1, colors.length))]);
                strokeCol.setAlpha(150);
                p.stroke(strokeCol);
                p.strokeWeight(p.random(1, 5));
                p.beginShape();
                for (let j = 0; j < 5; j++) {
                    let x = p.noise(i * 0.1, j * 0.5, p.millis() * 0.0001) * width;
                    let y = p.noise(j * 0.5, i * 0.1, p.millis() * 0.0001) * height;
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
        draw: (p, colors, width, height) => {
            p.background(p.color(colors[0]));
            const nodes = [];
            const numNodes = 100;
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
                    if (d < width * 0.15) {
                        let strokeCol = p.lerpColor(nodes[i].color, nodes[j].color, 0.5);
                        strokeCol.setAlpha(p.map(d, 0, width * 0.15, 255, 0));
                        p.stroke(strokeCol);
                        p.strokeWeight(1);
                        p.line(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
                    }
                }
                p.noStroke();
                p.fill(nodes[i].color);
                p.circle(nodes[i].x, nodes[i].y, p.random(3, 8));
            }
        }
    },
    {
        id: 'glacialFracture',
        name: 'Glacial Fracture',
        category: 'Geometry',
        description: 'Sharp, angular shards and crystalline structures.',
        popular: false,
        draw: (p, colors, width, height) => {
            p.background(p.color(colors[0]));
            for (let i = 0; i < 50; i++) {
                p.fill(p.color(colors[p.floor(p.random(1, colors.length))]));
                p.noStroke();
                p.beginShape();
                let startX = p.random(width);
                let startY = p.random(height);
                p.vertex(startX, startY);
                for(let j=0; j<4; j++) {
                    p.vertex(startX + p.random(-width*0.2, width*0.2), startY + p.random(-height*0.2, height*0.2));
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
        draw: (p, colors, width, height) => {
            p.background(p.color(colors[0]));
            p.noStroke();
            for (let i = 0; i < 2000; i++) {
                let x = p.random(width);
                let y = p.random(height);
                let r = p.random(0.5, 3);
                let col = p.color(colors[p.floor(p.random(1, colors.length))]);
                col.setAlpha(p.random(50, 255));
                p.fill(col);
                p.circle(x, y, r);
            }

            for(let i=0; i<5; i++) {
                let x = p.random(width);
                let y = p.random(height);
                let col = p.color(colors[p.floor(p.random(1, colors.length))]);
                for(let r=width*0.5; r>0; r-=width*0.05) {
                    col.setAlpha(p.map(r, width*0.5, 0, 0, 50));
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
        draw: (p, colors, width, height) => {
            p.background(p.color(colors[0]));
            p.noStroke();
            for(let i=0; i<100; i++) {
                let x = p.random(width);
                let y = p.random(height);
                let col = p.color(colors[p.floor(p.random(1, colors.length))]);
                let r = p.random(width*0.05, width*0.3);

                for(let j=0; j<10; j++) {
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
        draw: (p, colors, width, height) => {
            p.background(p.color(colors[0]));
            for (let i = 0; i < 300; i++) {
                let x = p.random(width);
                let y = p.random(height);
                let r = p.random(width * 0.01, width * 0.15);
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
        draw: (p, colors, width, height) => {
            p.background(p.color(colors[0]));
            const colWidth = 20;
            const cols = p.floor(width / colWidth);
            p.textSize(16);
            p.textFont('monospace');
            for(let i=0; i<cols; i++) {
                let y = p.random(-height, height);
                let streamLength = p.random(10, 40);
                for(let j=0; j<streamLength; j++) {
                    let char = String.fromCharCode(0x30A0 + p.random(0, 96));
                    let alpha = p.map(j, 0, streamLength, 255, 0);
                    let col = p.color(colors[p.floor(p.random(1, colors.length))]);
                    col.setAlpha(alpha);
                    p.fill(col);
                    p.text(char, i*colWidth, y - j*20);
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
        draw: (p, colors, width, height) => {
            p.background(p.color(colors[0]));
            const size = 30;
            const w = p.sqrt(3) * size;
            const h = 2 * size;
            const yOffset = 3/4 * h;
            p.strokeWeight(1);
            p.stroke(p.color(colors[1]));

            for(let row = 0; row < height/yOffset + 2; row++) {
                for(let col = 0; col < width/w + 2; col++) {
                    let x = col * w + (row % 2 === 1 ? w/2 : 0);
                    let y = row * yOffset;

                    let fillCol = p.color(colors[p.floor(p.random(1, colors.length))]);
                    if(p.random() > 0.3) fillCol.setAlpha(0); // Some empty
                    else fillCol.setAlpha(p.random(50, 200));

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
        draw: (p, colors, width, height) => {
            p.background(p.color(colors[0]));
            p.noStroke();
            for(let i=0; i<150; i++) {
                let x = p.random(width);
                let y = p.random(height);
                let r = p.random(width * 0.05, width * 0.2);
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
        draw: (p, colors, width, height) => {
            p.background(p.color(colors[0]));
            const particles = [];
            for(let i=0; i<1000; i++) {
                particles.push(p.createVector(p.random(width), p.random(height)));
            }

            p.strokeWeight(1);
            p.noFill();

            for(let i=0; i<30; i++) { // simulate steps
                for(let j=0; j<particles.length; j++) {
                    let particle = particles[j];
                    let angle = p.noise(particle.x * 0.005, particle.y * 0.005) * p.TWO_PI * 4;
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
        draw: (p, colors, width, height) => {
            p.background(p.color(colors[0]));

            // Grid
            p.strokeWeight(2);
            p.stroke(p.color(colors[1]));
            let horizon = height * 0.6;
            for(let i=0; i<width; i+=40) {
                p.line(i, horizon, (i - width/2) * 5 + width/2, height);
            }
            for(let j=horizon; j<height; j+=Math.pow((j-horizon)/5, 1.5) + 5) {
                p.line(0, j, width, j);
            }

            // Sun
            p.noStroke();
            let sunX = width / 2;
            let sunY = horizon;
            let sunR = p.min(width, height) * 0.3;

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
        draw: (p, colors, width, height) => {
            p.background(p.color(colors[0]));
            p.strokeWeight(2);
            p.noFill();

            for(let i=0; i<50; i++) {
                let x = p.random(width);
                let y = p.random(height);
                let col = p.color(colors[p.floor(p.random(1, colors.length))]);
                p.stroke(col);
                p.fill(col);
                p.circle(x, y, 6);
                p.noFill();

                p.beginShape();
                p.vertex(x, y);
                for(let j=0; j<4; j++) {
                    if(p.random() > 0.5) {
                        x += p.random(-50, 50);
                    } else {
                        y += p.random(-50, 50);
                    }
                    p.vertex(x, y);
                }
                p.endShape();
                p.fill(col);
                p.circle(x, y, 6);
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
        draw: (p, colors, width, height) => {
            p.background(p.color(colors[0]));
            p.noStroke();

            for(let i=1; i<colors.length; i++) {
                let col = p.color(colors[i]);
                p.fill(col);
                p.beginShape();
                p.vertex(0, height);
                p.vertex(0, p.random(height));

                // create bezier curve
                let cp1x = p.random(width * 0.3);
                let cp1y = p.random(height);
                let cp2x = p.random(width * 0.7, width);
                let cp2y = p.random(height);
                let ex = width;
                let ey = p.random(height);

                p.bezierVertex(cp1x, cp1y, cp2x, cp2y, ex, ey);
                p.vertex(width, height);
                p.endShape(p.CLOSE);
            }
        }
    },
    {
        id: 'sakuraPetals',
        name: 'Sakura Petals',
        category: 'Asian',
        description: 'Falling petals blown gently across the screen.',
        popular: false,
        draw: (p, colors, width, height) => {
            p.background(p.color(colors[0]));
            p.noStroke();

            for(let i=0; i<300; i++) {
                let x = p.random(width);
                let y = p.random(height);
                let s = p.random(5, 15);
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
        draw: (p, colors, width, height) => {
            p.background(p.color(colors[0]));
            p.noStroke();

            for(let i=0; i<10; i++) {
                let x = p.random(width);
                let y = p.random(height);
                let r = p.random(width * 0.4, width);
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
